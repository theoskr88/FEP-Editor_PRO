package com.fep.editorpro;

import android.media.MediaCodec;
import android.media.MediaCodecInfo;
import android.media.MediaFormat;
import android.media.MediaMuxer;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.media.Image;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.annotation.ActivityCallback;
import java.io.FileInputStream;
import java.io.OutputStream;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.nio.ByteBuffer;

@CapacitorPlugin(name="FepVideo")
public class FepVideoPlugin extends Plugin {
  private MediaCodec codec;
  private MediaMuxer muxer;
  private File output;
  private int width,height,fps,frames,track=-1,colorFormat;
  private boolean muxerStarted=false;
  private final MediaCodec.BufferInfo info=new MediaCodec.BufferInfo();
  private static final int TIMEOUT=200000;

  @PluginMethod public synchronized void start(PluginCall call){
    if(codec!=null){call.reject("Ya existe una grabación");return;}
    width=call.getInt("width",720);height=call.getInt("height",404);fps=call.getInt("fps",15);
    if(width<2||height<2||width>1280||height>720||width%2!=0||height%2!=0||fps<1||fps>30){
      call.reject("Resolución o FPS incompatibles");return;
    }
    try{
      output=new File(getContext().getCacheDir(),"fep-360-"+System.currentTimeMillis()+".mp4");
      MediaFormat format=MediaFormat.createVideoFormat("video/avc",width,height);
      codec=MediaCodec.createEncoderByType("video/avc");
      int[] formats=codec.getCodecInfo().getCapabilitiesForType("video/avc").colorFormats;
      colorFormat=0;
      for(int value:formats)if(value==MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar)colorFormat=value;
      if(colorFormat==0)for(int value:formats)if(value==MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Planar)colorFormat=value;
      if(colorFormat==0)for(int value:formats)if(value==MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible)colorFormat=value;
      if(colorFormat==0)throw new IllegalStateException("Sin codificador YUV420 compatible");
      format.setInteger(MediaFormat.KEY_COLOR_FORMAT,colorFormat);
      format.setInteger(MediaFormat.KEY_BIT_RATE,2500000);
      format.setInteger(MediaFormat.KEY_FRAME_RATE,fps);
      format.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL,2);
      codec.configure(format,null,null,MediaCodec.CONFIGURE_FLAG_ENCODE);
      codec.start();
      muxer=new MediaMuxer(output.getAbsolutePath(),MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4);
      track=-1;muxerStarted=false;frames=0;call.resolve();
    }catch(Exception e){dispose(true);call.reject("No se pudo iniciar MP4: "+e.getMessage(),e);}
  }

  @PluginMethod public synchronized void frame(PluginCall call){
    if(codec==null){call.reject("La grabación no está iniciada");return;}
    try{
      String data=call.getString("data");
      if(data==null||data.length()>8*1024*1024)throw new IllegalArgumentException("Fotograma inválido");
      byte[] source=Base64.decode(data,Base64.DEFAULT);
      Bitmap decoded=BitmapFactory.decodeByteArray(source,0,source.length);
      if(decoded==null)throw new IllegalArgumentException("No se puede decodificar el fotograma");
      Bitmap bitmap=decoded.getWidth()==width&&decoded.getHeight()==height?decoded:Bitmap.createScaledBitmap(decoded,width,height,true);
      int[] pixels=new int[width*height];bitmap.getPixels(pixels,0,width,0,0,width,height);
      if(bitmap!=decoded)bitmap.recycle();decoded.recycle();
      int index=codec.dequeueInputBuffer(TIMEOUT);if(index<0)throw new IllegalStateException("Codificador sin entrada disponible");
      if(colorFormat==MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible){
        Image image=codec.getInputImage(index);
        if(image==null)throw new IllegalStateException("El codificador no admite entrada flexible");
        try{writeFlexible(image,pixels,width,height);}finally{image.close();}
        codec.queueInputBuffer(index,0,width*height*3/2,frames*1000000L/fps,0);
      }else{
        ByteBuffer buffer=codec.getInputBuffer(index);
        if(buffer==null)throw new IllegalStateException("Buffer de vídeo no disponible");
        byte[] yuv=toYuv(pixels,width,height,colorFormat==MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar);
        buffer.clear();buffer.put(yuv);
        codec.queueInputBuffer(index,0,yuv.length,frames*1000000L/fps,0);
      }
      frames++;drain(false);
      JSObject ret=new JSObject();ret.put("frames",frames);call.resolve(ret);
    }catch(Exception e){dispose(true);call.reject("No se pudo codificar fotograma: "+e.getMessage(),e);}
  }

  @PluginMethod public synchronized void finish(PluginCall call){
    if(codec==null){call.reject("No existe una grabación");return;}
    try{
      if(frames<2)throw new IllegalStateException("Video sin fotogramas");
      int index=codec.dequeueInputBuffer(TIMEOUT);
      if(index<0)throw new IllegalStateException("No se pudo finalizar el codificador");
      codec.queueInputBuffer(index,0,0,frames*1000000L/fps,MediaCodec.BUFFER_FLAG_END_OF_STREAM);
      drain(true);
      File file=output;dispose(false);
      if(!file.isFile()||file.length()<1024)throw new IllegalStateException("El video generado está vacío");
      Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);
      intent.addCategory(Intent.CATEGORY_OPENABLE);
      intent.setType("video/mp4");
      intent.putExtra(Intent.EXTRA_TITLE,"FEP-mockup-360.mp4");
      startActivityForResult(call,intent,"onVideoSave");
    }catch(Exception e){dispose(true);call.reject("No se pudo finalizar MP4: "+e.getMessage(),e);}
  }

  @ActivityCallback private void onVideoSave(PluginCall call,ActivityResult result){
    if(result.getResultCode()!=Activity.RESULT_OK||result.getData()==null||result.getData().getData()==null){
      call.reject("Se canceló el guardado del video");return;
    }
    if(output==null||!output.isFile()||output.length()<1024){call.reject("No existe un MP4 válido");return;}
    Uri uri=result.getData().getData();
    try(FileInputStream in=new FileInputStream(output);OutputStream out=getContext().getContentResolver().openOutputStream(uri,"w")){
      if(out==null)throw new java.io.IOException("Sin acceso al destino");
      byte[] buffer=new byte[32768];int count;long saved=0;
      while((count=in.read(buffer))!=-1){out.write(buffer,0,count);saved+=count;}
      out.flush();
      if(saved!=output.length())throw new java.io.IOException("Copia incompleta");
      JSObject response=new JSObject();response.put("uri",uri.toString());response.put("bytes",saved);call.resolve(response);
      output.delete();output=null;
    }catch(Exception e){call.reject("No se pudo guardar el MP4: "+e.getMessage(),e);}
  }
  private static void writeFlexible(Image image,int[] px,int w,int h){
    Image.Plane[] planes=image.getPlanes();
    if(planes.length<3)throw new IllegalStateException("Planos YUV no disponibles");
    for(int y=0;y<h;y++)for(int x=0;x<w;x++){
      int p=px[y*w+x],r=(p>>16)&255,g=(p>>8)&255,b=p&255;
      Image.Plane yp=planes[0];yp.getBuffer().put(y*yp.getRowStride()+x*yp.getPixelStride(),
        (byte)bound(((66*r+129*g+25*b+128)>>8)+16));
      if((x&1)==0&&(y&1)==0){
        Image.Plane up=planes[1],vp=planes[2];int ix=(y/2)*up.getRowStride()+(x/2)*up.getPixelStride();
        int vx=(y/2)*vp.getRowStride()+(x/2)*vp.getPixelStride();
        up.getBuffer().put(ix,(byte)bound(((-38*r-74*g+112*b+128)>>8)+128));
        vp.getBuffer().put(vx,(byte)bound(((112*r-94*g-18*b+128)>>8)+128));
      }
    }
  }
  @PluginMethod public synchronized void cancel(PluginCall call){dispose(true);call.resolve();}

  private void drain(boolean end){
    int idle=0;
    while(true){
      int index=codec.dequeueOutputBuffer(info,TIMEOUT);
      if(index==MediaCodec.INFO_OUTPUT_FORMAT_CHANGED){
        if(muxerStarted)throw new IllegalStateException("Formato de video duplicado");
        track=muxer.addTrack(codec.getOutputFormat());muxer.start();muxerStarted=true;
      }else if(index>=0){
        ByteBuffer out=codec.getOutputBuffer(index);
        if(out!=null && info.size>0 && muxerStarted && (info.flags&MediaCodec.BUFFER_FLAG_CODEC_CONFIG)==0){
          out.position(info.offset);out.limit(info.offset+info.size);
          muxer.writeSampleData(track,out,info);
        }
        boolean finished=(info.flags&MediaCodec.BUFFER_FLAG_END_OF_STREAM)!=0;
        codec.releaseOutputBuffer(index,false);
        if(finished)return;
        idle=0;
        if(!end && info.size==0)return;
      }else if(index==MediaCodec.INFO_TRY_AGAIN_LATER){
        if(!end||++idle>=3)return;
      }
    }
  }
  private void dispose(boolean remove){
    try{if(codec!=null)codec.stop();}catch(Exception ignored){}
    try{if(codec!=null)codec.release();}catch(Exception ignored){}
    codec=null;
    try{if(muxer!=null&&muxerStarted)muxer.stop();}catch(Exception ignored){}
    try{if(muxer!=null)muxer.release();}catch(Exception ignored){}
    muxer=null;muxerStarted=false;
    if(remove&&output!=null)output.delete();
  }
  private static int bound(int n){return Math.max(0,Math.min(255,n));}
  private static byte[] toYuv(int[] pixels,int w,int h,boolean semi){
    int size=w*h;byte[] out=new byte[size*3/2];
    int uv=size,vu=size+size/4;
    for(int y=0;y<h;y++)for(int x=0;x<w;x++){
      int p=pixels[y*w+x],r=(p>>16)&255,g=(p>>8)&255,b=p&255;
      out[y*w+x]=(byte)bound(((66*r+129*g+25*b+128)>>8)+16);
      if((x&1)==0&&(y&1)==0){
        int u=bound(((-38*r-74*g+112*b+128)>>8)+128);
        int v=bound(((112*r-94*g-18*b+128)>>8)+128);
        if(semi){out[uv++]=(byte)u;out[uv++]=(byte)v;}
        else{out[uv++]=(byte)u;out[vu++]=(byte)v;}
      }
    }
    return out;
  }
}
