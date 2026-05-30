package com.study.material.platform;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.startapp.sdk.adsbase.StartAppSDK;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize Start.io (StartApp) SDK with App ID: 204789628
        // Set Return Ads disabled for optimal student user experience
        StartAppSDK.initParams(this, "204789628")
            .setReturnAdsEnabled(false)
            .init();
    }
}
