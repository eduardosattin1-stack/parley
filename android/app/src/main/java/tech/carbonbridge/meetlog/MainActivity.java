package tech.carbonbridge.meetlog;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register local plugins before the bridge initializes.
        registerPlugin(FarFieldRecorder.class);
        super.onCreate(savedInstanceState);
    }
}
