package com.fep.editorpro;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
  @Override public void onCreate(Bundle savedInstanceState){
    registerPlugin(FepFilesPlugin.class);
    registerPlugin(FepVideoPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
