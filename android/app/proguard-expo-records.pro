# Keep Expo record / @Field conversion working under R8 *optimize*.
# Without this, takePictureAsync / image-picker options throw:
#   cannot be cast to type ...PictureOptions (ReadableNativeMap) + NPE

-keepattributes *Annotation*
-keepattributes RuntimeVisibleAnnotations,RuntimeVisibleParameterAnnotations,AnnotationDefault
-keepattributes Signature,InnerClasses,EnclosingMethod

# Kotlin reflection used by RecordTypeConverter.findAnnotation / memberProperties
-keep class kotlin.Metadata { *; }
-keep class kotlin.reflect.** { *; }
-dontwarn kotlin.reflect.**
-dontwarn kotlin.Metadata

# Do not rename the @Field annotation (R8 otherwise breaks Field.key)
-keep @interface expo.modules.kotlin.records.Field { *; }
-keep @interface expo.modules.kotlin.records.Required { *; }
-keep @interface expo.modules.kotlin.records.BindUsing { *; }
-keep interface expo.modules.kotlin.records.Record { *; }

# Keep Expo modules + record option classes and their fields/ctors
-keep class expo.modules.** { *; }
-keepclassmembers class expo.modules.** { *; }
-keepclassmembers class * implements expo.modules.kotlin.records.Record {
    <init>(...);
    <fields>;
    <methods>;
}
