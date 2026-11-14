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
      try(OutputStream out=getContext().getContentResolver().openOutputStream(uri,"w")){
        if(out==null)throw new java.io.IOException("Sin acceso al archivo");
        out.write(data);out.flush();
      }
      JSObject response=new JSObject();response.put("uri",uri.toString());response.put("bytes",data.length);
      call.resolve(response);
    }catch(Exception e){call.reject("No se pudo escribir el archivo",e);}
  }
}
