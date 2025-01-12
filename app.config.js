export default {
    scheme: "acme",
    web: {
        bundler: "metro"
    },
    userInterfaceStyle: "automatic",
    ios: {
        userInterfaceStyle: "automatic",
        bundleIdentifier: "com.glowr"
    },
    android: {
        userInterfaceStyle: "automatic",
        permissions: [
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.FOREGROUND_SERVICE",
            "android.permission.RECORD_AUDIO"
        ],
        package: "com.glowr",
    },
    name: "Glowr",
    slug: "glowr",
    icon: "./assets/logo3.png",
    splash: {
        image: "./assets/splash2.png",
        resizeMode: "contain",
        backgroundColor: "#111111"
    },
    plugins: [
        [
            "expo-location",
            {
                locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
            }
        ],
        [
            "expo-image-picker",
            {
                photosPermission: "Allow $(PRODUCT_NAME) to access your gallery."
            }
        ],
        [
            "expo-build-properties",
            {
                android: {
                    compileSdkVersion: 33,
                    targetSdkVersion: 33,
                    buildToolsVersion: "33.0.0",
                    multiDexEnabled: true
                },
                ios: {
                    deploymentTarget: "13.0"
                }
            }
        ],
        [
            "expo-localization"
        ],
        [
            "expo-router"
        ]
    ],
    extra: {
        eas: {
            projectId: "42707fb9-b44e-448c-a22b-3d7f16155c6a"
        },
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
};
