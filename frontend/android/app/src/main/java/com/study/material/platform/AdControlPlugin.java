package com.study.material.platform;

import com.getcapacitor.JSObject;
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
 *   await AdControl.showInterstitial(); // call to show an interstitial ad
 *   const res = await AdControl.showRewarded(); // call to show a rewarded video ad
 */
@CapacitorPlugin(name = "AdControl")
public class AdControlPlugin extends Plugin {

    public interface AdCallback {
        void onSuccess();
        void onFailure(String error);
        void onRewardEarned();
        void onAdClosed();
    }

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

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        MainActivity activity = (MainActivity) getActivity();
        activity.showInterstitial(new AdCallback() {
            @Override
            public void onSuccess() {
                // Ad displayed
            }

            @Override
            public void onFailure(String error) {
                // Reject so React can fall back instantly without blocking the user
                call.reject(error);
            }

            @Override
            public void onRewardEarned() {
                // No rewards for normal interstitial
            }

            @Override
            public void onAdClosed() {
                // Resolve when ad is closed so React flow continues
                JSObject result = new JSObject();
                result.put("status", "closed");
                call.resolve(result);
            }
        });
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        MainActivity activity = (MainActivity) getActivity();
        activity.showRewarded(new AdCallback() {
            private boolean isRewarded = false;

            @Override
            public void onSuccess() {
                // Ad displayed
            }

            @Override
            public void onFailure(String error) {
                // Reject on failure so React continues with fallback
                call.reject(error);
            }

            @Override
            public void onRewardEarned() {
                isRewarded = true;
            }

            @Override
            public void onAdClosed() {
                // Resolve when closed, showing if they earned the reward
                JSObject result = new JSObject();
                result.put("rewarded", isRewarded);
                call.resolve(result);
            }
        });
    }
}
