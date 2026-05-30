package com.study.material.platform;

import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

import com.getcapacitor.BridgeActivity;
import com.startapp.sdk.adsbase.StartAppSDK;
import com.startapp.sdk.ads.banner.Banner;
import com.startapp.sdk.ads.banner.BannerListener;

public class MainActivity extends BridgeActivity {

    private Banner  startAppBanner;
    private LinearLayout adContainer;
    private boolean adVisible = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register AdControl plugin BEFORE super.onCreate
        registerPlugin(AdControlPlugin.class);

        super.onCreate(savedInstanceState);

        // ── Initialize Start.io SDK ───────────────────────────────────────────
        StartAppSDK.initParams(this, "204789628")
            .setReturnAdsEnabled(false)
            .init();

        // ── Create Banner Ad (shown to non-premium users) ─────────────────────
        setupBannerAd();
    }

    /**
     * Creates Start.io Banner Ad and attaches it as a native overlay at bottom.
     * Ad stays HIDDEN until React calls showAds() for free users.
     */
    private void setupBannerAd() {
        try {
            startAppBanner = new Banner(this);
            startAppBanner.setBannerListener(new BannerListener() {
                @Override
                public void onReceiveAd(View view) {
                    // Real ad filled — make visible if user is non-premium
                    if (adContainer != null && adVisible) {
                        adContainer.setVisibility(View.VISIBLE);
                    }
                }

                @Override
                public void onFailedToReceiveAd(View view) {
                    // No ad inventory — hide silently (never crash)
                    if (adContainer != null) {
                        adContainer.setVisibility(View.GONE);
                    }
                }

                @Override public void onImpression(View view) { }
                @Override public void onClick(View view)      { }
            });

            adContainer = new LinearLayout(this);
            adContainer.setOrientation(LinearLayout.VERTICAL);
            adContainer.setGravity(Gravity.CENTER);
            adContainer.setVisibility(View.GONE); // hidden by default
            adContainer.addView(startAppBanner);

            FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            );
            params.gravity = Gravity.BOTTOM;

            FrameLayout root = (FrameLayout) getWindow().getDecorView()
                .findViewById(android.R.id.content);
            root.addView(adContainer, params);

            // Preload ad so it's ready immediately when shown
            startAppBanner.loadAd();

        } catch (Exception e) {
            e.printStackTrace(); // Never crash on ad errors
        }
    }

    /** Called by AdControlPlugin → React frontend when user is FREE */
    public void showBannerAd() {
        adVisible = true;
        if (adContainer != null) {
            adContainer.setVisibility(View.VISIBLE);
        }
        if (startAppBanner != null) {
            startAppBanner.loadAd(); // refresh
        }
    }

    /** Called by AdControlPlugin → React frontend when user is PREMIUM */
    public void hideBannerAd() {
        adVisible = false;
        if (adContainer != null) {
            adContainer.setVisibility(View.GONE);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (startAppBanner != null && adVisible) {
            startAppBanner.loadAd();
        }
    }

    @Override
    protected void onDestroy() {
        if (startAppBanner != null) {
            startAppBanner.hideBanner();
        }
        super.onDestroy();
    }
}
