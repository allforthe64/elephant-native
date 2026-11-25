# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# @generated begin expo-build-properties - expo prebuild (DO NOT MODIFY)
-keep class org.wonday.pdf.** { *; }
-keep class com.github.barteksc.pdfviewer.** { *; }
-keep class io.legere.pdfiumandroid.** { *; }
-keep class com.shockwave.** { *; }
-keep class com.ReactNativeBlobUtil.** { *; }
-keep class com.reactnativedocumentscanner.** { *; }
-keep class com.imagespdf.** { *; }
-keepattributes *Annotation*
-keepattributes RuntimeVisibleAnnotations,RuntimeVisibleParameterAnnotations,AnnotationDefault
-keep class expo.modules.** { *; }
-keep interface expo.modules.kotlin.records.Record { *; }
-keepclassmembers class * implements expo.modules.kotlin.records.Record { *; }
-keep @interface expo.modules.kotlin.records.Field { *; }
-keepclassmembers class * {
    @expo.modules.kotlin.records.Field <fields>;
}
-dontwarn com.google.errorprone.annotations.**
-dontwarn com.google.j2objc.annotations.**
-dontwarn javax.lang.model.**
-dontwarn org.checkerframework.**
-dontwarn sun.misc.Unsafe
# @generated end expo-build-properties