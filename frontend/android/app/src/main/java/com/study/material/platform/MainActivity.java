package com.study.material.platform;

import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

import com.getcapacitor.BridgeActivity;
import com.startapp.sdk.adsbase.StartAppSDK;
import com.startapp.sdk.adsbase.StartAppAd;
import com.startapp.sdk.adsbase.Ad;
import com.startapp.sdk.adsbase.adlisteners.AdEventListener;
import com.startapp.sdk.adsbase.adlisteners.VideoListener;
import com.startapp.sdk.adsbase.adlisteners.AdDisplayListener;
import com.startapp.sdk.ads.banner.Banner;
import com.startapp.sdk.ads.banner.BannerListener;

public class MainActivity extends BridgeActivity {

    private Banner startAppBanner;
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

    /** Shows full-screen Interstitial Ad (Earning Ad) programmatically */
    public void showInterstitial(final AdControlPlugin.AdCallback callback) {
        runOnUiThread(() -> {
            try {
                final StartAppAd startAppAd = new StartAppAd(MainActivity.this);
                startAppAd.loadAd(new AdEventListener() {
                    @Override
                    public void onReceiveAd(Ad ad) {
                        startAppAd.showAd(new AdDisplayListener() {
                            @Override
                            public void adDisplayed(Ad ad) {
                                if (callback != null) callback.onSuccess();
                            }

                            @Override
                            public void adNotDisplayed(Ad ad) {
                                if (callback != null) callback.onFailure("Ad not displayed: " + ad.getErrorMessage());
                            }

                            @Override
                            public void adClicked(Ad ad) {}

                            @Override
                            public void adHidden(Ad ad) {
                                if (callback != null) callback.onAdClosed();
                            }
                        });
                    }

                    @Override
                    public void onFailedToReceiveAd(Ad ad) {
                        if (callback != null) callback.onFailure("Failed to receive interstitial: " + ad.getErrorMessage());
                    }
                });
            } catch (Exception e) {
                if (callback != null) callback.onFailure("Exception showing interstitial: " + e.getMessage());
            }
        });
    }

    /** Shows full-screen Rewarded Video Ad (High Earning Ad) programmatically */
    public void showRewarded(final AdControlPlugin.AdCallback callback) {
        runOnUiThread(() -> {
            try {
                final StartAppAd rewardedAd = new StartAppAd(MainActivity.this);
                
                rewardedAd.setVideoListener(new VideoListener() {
                    @Override
                    public void onVideoCompleted() {
                        if (callback != null) callback.onRewardEarned();
                    }
                });

                rewardedAd.loadAd(StartAppAd.AdMode.REWARDED_VIDEO, new AdEventListener() {
                    @Override
                    public void onReceiveAd(Ad ad) {
                        rewardedAd.showAd(new AdDisplayListener() {
                            @Override
                            public void adDisplayed(Ad ad) {
                                if (callback != null) callback.onSuccess();
                            }

                            @Override
                            public void adNotDisplayed(Ad ad) {
                                if (callback != null) callback.onFailure("Ad not displayed: " + ad.getErrorMessage());
                            }

                            @Override
                            public void adClicked(Ad ad) {}

                            @Override
                            public void adHidden(Ad ad) {
                                if (callback != null) callback.onAdClosed();
                            }
                        });
                    }

                    @Override
                    public void onFailedToReceiveAd(Ad ad) {
                        if (callback != null) callback.onFailure("Failed to receive rewarded video: " + ad.getErrorMessage());
                    }
                });
            } catch (Exception e) {
                if (callback != null) callback.onFailure("Exception showing rewarded video: " + e.getMessage());
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        if (startAppBanner != null && adVisible) {
            startAppBanner.loadAd();
        }
    }

    @Override
    public void onDestroy() {
        if (startAppBanner != null) {
            startAppBanner.hideBanner();
        }
        super.onDestroy();
    }
}
