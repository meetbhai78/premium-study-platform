package com.study.material.platform;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * AdControlPlugin — Capacitor bridge between React frontend and Android native ads.
 *
 * Usage from React (JavaScript):
 *   import { Plugins } from '@capacitor/core';
 *   const { AdControl } = Plugins;
 *   await AdControl.hideAds();   // call when user is premium
 *   await AdControl.showAds();   // call when user is free
 */
@CapacitorPlugin(name = "AdControl")
public class AdControlPlugin extends Plugin {

    @PluginMethod
    public void hideAds(PluginCall call) {
        // Get MainActivity and hide the banner ad
        MainActivity activity = (MainActivity) getActivity();
        activity.runOnUiThread(() -> {
            activity.hideBannerAd();
        });
        call.resolve();
    }

    @PluginMethod
    public void showAds(PluginCall call) {
        // Get MainActivity and show the banner ad
        MainActivity activity = (MainActivity) getActivity();
        activity.runOnUiThread(() -> {
            activity.showBannerAd();
        });
        call.resolve();
    }
}
