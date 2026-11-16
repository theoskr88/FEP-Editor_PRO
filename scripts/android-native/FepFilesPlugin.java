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
}
