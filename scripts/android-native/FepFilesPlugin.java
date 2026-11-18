package com.fep.editorpro;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.UUID;


@CapacitorPlugin(name = "FepFiles")
public class FepFilesPlugin extends Plugin {
  @PluginMethod public void saveFile(PluginCall call) {
    String name=call.getString("name"), data=call.getString("data"), mime=call.getString("mime","application/octet-stream");
    if(name==null||data==null) {call.reject("Archivo incompleto"); return;}
    if(data.length()>43*1024*1024) {call.reject("Archivo demasiado grande");return;}
    try {
      Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);
      intent.addCategory(Intent.CATEGORY_OPENABLE);
      intent.setType(mime);
      intent.putExtra(Intent.EXTRA_TITLE,name);
      startActivityForResult(call,intent,"onSave");
    }catch(Exception e){call.reject("No se pudo abrir el selector de archivos",e);}
  }
  @ActivityCallback private void onSave(PluginCall call, ActivityResult result){
    if(result.getResultCode()!=Activity.RESULT_OK||result.getData()==null||result.getData().getData()==null){
      call.reject("Guardado cancelado");return;
    }
    Uri uri=result.getData().getData();
    try {
      byte[] data=Base64.decode(call.getString("data"),Base64.DEFAULT);
      if(data.length<8)throw new java.io.IOException("Archivo sin contenido válido");
      String mime=call.getString("mime","application/octet-stream");
      if("image/png".equals(mime)&&!(data[0]==(byte)137&&data[1]==80&&data[2]==78&&data[3]==71&&data[4]==13&&data[5]==10&&data[6]==26&&data[7]==10))
        throw new java.io.IOException("PNG inválido antes de guardar");
      if("image/jpeg".equals(mime)&&!(data[0]==(byte)255&&data[1]==(byte)216&&data[data.length-2]==(byte)255&&data[data.length-1]==(byte)217))
        throw new java.io.IOException("JPEG inválido antes de guardar");
      try(OutputStream out=getContext().getContentResolver().openOutputStream(uri,"w")){
        if(out==null)throw new java.io.IOException("Sin acceso al archivo");
        out.write(data);out.flush();
      }
      // Reabrir y validar byte por byte: evitar reportar éxito para archivos truncados.
      int pos=0;
      try(InputStream in=getContext().getContentResolver().openInputStream(uri)){
        if(in==null)throw new java.io.IOException("No se puede reabrir el archivo guardado");
        byte[] check=new byte[32768];int n;
        while((n=in.read(check))!=-1){
          if(pos+n>data.length)throw new java.io.IOException("El archivo guardado tiene bytes adicionales");
          for(int i=0;i<n;i++)if(check[i]!=data[pos+i])throw new java.io.IOException("El archivo se alteró al guardarlo");
          pos+=n;
        }
      }
      if(pos!=data.length)throw new java.io.IOException("Guardado incompleto: "+pos+"/"+data.length);
      JSObject response=new JSObject();response.put("uri",uri.toString());response.put("bytes",pos);
      call.resolve(response);
    }catch(Exception e){call.reject("No se pudo escribir el archivo",e);}
  }
  // Guardado Android por bloques. No mantiene archivos completos en JS ni Java.
  private OutputStream activeStream;
  private Uri activeUri;
  private String activeSession;
  private MessageDigest activeDigest;
  private long activeBytes;

  @PluginMethod public synchronized void beginStream(PluginCall call) {
    if(activeStream!=null){call.reject("Ya hay un archivo en proceso de guardado");return;}
    String name=call.getString("name"),mime=call.getString("mime","application/octet-stream");
    if(name==null||name.isBlank()){call.reject("Nombre de archivo vacío");return;}
    if(name.length()>120){call.reject("Nombre demasiado largo");return;}
    try {
      Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);
      intent.addCategory(Intent.CATEGORY_OPENABLE);
      intent.setType(mime);
      intent.putExtra(Intent.EXTRA_TITLE,name);
      startActivityForResult(call,intent,"onBeginStream");
    }catch(Exception e){call.reject("No se pudo abrir el selector de archivos",e);}
  }

  @ActivityCallback private synchronized void onBeginStream(PluginCall call,ActivityResult result) {
    if(result.getResultCode()!=Activity.RESULT_OK||result.getData()==null||result.getData().getData()==null){
      call.reject("Guardado cancelado");return;
    }
    if(activeStream!=null){call.reject("Existe otro guardado activo");return;}
    Uri uri=result.getData().getData();
    try {
      activeStream=getContext().getContentResolver().openOutputStream(uri,"w");
      if(activeStream==null)throw new java.io.IOException("Destino no disponible");
      activeUri=uri;
      activeSession=UUID.randomUUID().toString();
      activeDigest=MessageDigest.getInstance("SHA-256");
      activeBytes=0;
      JSObject response=new JSObject();response.put("session",activeSession);call.resolve(response);
    }catch(Exception e){closeActive();call.reject("No se pudo crear el archivo",e);}
  }

  @PluginMethod public synchronized void appendStream(PluginCall call){
    if(!ownsSession(call)){call.reject("No existe un guardado con esta sesión");return;}
    String encoded=call.getString("data");
    if(encoded==null||encoded.length()>900000){call.reject("Bloque de archivo inválido");return;}
    try {
      byte[] block=Base64.decode(encoded,Base64.DEFAULT);
      if(block.length==0||block.length>524288)throw new java.io.IOException("Tamaño de bloque no permitido");
      if(activeBytes+block.length>200L*1024*1024)throw new java.io.IOException("Archivo supera 200 MiB");
      activeStream.write(block);
      activeDigest.update(block);
      activeBytes+=block.length;
      JSObject response=new JSObject();response.put("bytesWritten",activeBytes);call.resolve(response);
    }catch(Exception e){closeActive();call.reject("No se pudo escribir el bloque",e);}
  }

  @PluginMethod public synchronized void finishStream(PluginCall call){
    if(!ownsSession(call)){call.reject("No existe un guardado con esta sesión");return;}
    try {
      activeStream.flush();activeStream.close();activeStream=null;
      final byte[] expected=activeDigest.digest();
      MessageDigest check=MessageDigest.getInstance("SHA-256");
      long length=0;
      try(InputStream in=getContext().getContentResolver().openInputStream(activeUri)){
        if(in==null)throw new java.io.IOException("El archivo no puede reabrirse");
        byte[] buffer=new byte[32768];int n;
        while((n=in.read(buffer))!=-1){check.update(buffer,0,n);length+=n;}
      }
      if(length!=activeBytes||!Arrays.equals(expected,check.digest()))
        throw new java.io.IOException("El archivo guardado no coincide con el original");
      JSObject response=new JSObject();response.put("bytes",length);response.put("uri",activeUri.toString());
      closeActive();call.resolve(response);
    }catch(Exception e){closeActive();call.reject("No se pudo verificar el archivo guardado",e);}
  }

  @PluginMethod public synchronized void cancelStream(PluginCall call){
    if(!ownsSession(call)){call.resolve();return;}
    closeActive();call.resolve();
  }
  private boolean ownsSession(PluginCall call){
    String session=call.getString("session");
    return session!=null&&session.equals(activeSession)&&activeStream!=null;
  }
  private void closeActive(){
    try{if(activeStream!=null)activeStream.close();}catch(Exception ignored){}
    activeStream=null;activeSession=null;activeDigest=null;activeUri=null;activeBytes=0;
  }

}
