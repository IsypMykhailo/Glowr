export default {
    scheme: "acme",
    web: {
        bundler: "metro"
    },
    userInterfaceStyle: "automatic",
    ios: {
        userInterfaceStyle: "automatic"
    },
    android: {
        userInterfaceStyle: "automatic",
        permissions: [
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.FOREGROUND_SERVICE",
            "android.permission.RECORD_AUDIO"
        ],
        package: "Glowr"
    },
    name: "Glowr",
    slug: "Glowr",
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
                    compileSdkVersion: 31,
                    targetSdkVersion: 31,
                    buildToolsVersion: "31.0.0",
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
            projectId: "763a80fc-2338-430b-afd0-db846a0df2a1"
        },
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
};
