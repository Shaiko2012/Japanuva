package com.japanuva.app;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {
    private static final String HOME_URL = "https://japanuva.vercel.app";
    private static final String OFFLINE_URL = "file:///android_asset/public/offline.html";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (bridge == null) {
            return;
        }

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        WindowInsetsControllerCompat insets =
            new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
        insets.setAppearanceLightStatusBars(true);
        insets.setAppearanceLightNavigationBars(true);

        WebView webView = bridge.getWebView();
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportMultipleWindows(false);

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(webView, true);

        bridge.setWebViewClient(
            new BridgeWebViewClient(bridge) {
                @Override
                public void onReceivedError(
                    WebView view,
                    WebResourceRequest request,
                    WebResourceError error
                ) {
                    if (request.isForMainFrame()) {
                        String failed = request.getUrl() != null
                            ? request.getUrl().toString()
                            : "";
                        if (!failed.startsWith("file://")) {
                            view.post(() -> view.loadUrl(OFFLINE_URL));
                            return;
                        }
                    }
                    super.onReceivedError(view, request, error);
                }
            }
        );

        getOnBackPressedDispatcher()
            .addCallback(
                this,
                new OnBackPressedCallback(true) {
                    @Override
                    public void handleOnBackPressed() {
                        WebView view = bridge.getWebView();
                        if (view != null && view.canGoBack()) {
                            String url = view.getUrl() == null ? "" : view.getUrl();
                            if (url.startsWith("file://")) {
                                view.loadUrl(HOME_URL);
                                return;
                            }
                            view.goBack();
                            return;
                        }
                        setEnabled(false);
                        getOnBackPressedDispatcher().onBackPressed();
                    }
                }
            );
    }
}
