---
title: Using JsonConverter to hide passwords from the client
date: 2020-04-22
tags:
    - dotnet
---

`version: 3.1`

I had a problem where I needed to hide user passwords from the client. dotnet core automatically serializes every field and sends it back.

example:

```javascript
http GET /user/2
{
    "username":"Foo",
    "password":"{passwordhash}",    // we need to hide this
    "role":"user"
}
```

I tried using the `[JsonIgnore]` attribute but that also ignores incoming passwords. I also could have probably used a DTO(data transfer object) but I felt lazy. I found a solution using the JsonConverter class. I am using Newtonsoft.Json I don't know if this will work with Json.Net

`JToken` is an abstract class which is the base class of `JObject, JProperty, JArray,` etc

`JObject` represents a Json object

```csharp
class UserConverter : JsonConverter
    {
        // returns true if we want to change the type
        public override bool CanConvert(Type objectType)
        {
            // we only want to convert users
            return typeof(UserModel).IsAssignableFrom(objectType));
        }

        // We do not want to deserialize Json
        public override bool CanRead => false;

        // This method is called to serialize the Json
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {

            // Create a Json token from the object
            var t = JToken.FromObject(user);


            // Convert the Json token to a Json object
            var o = (JObject)t;

            // remove the password property
            o.Remove("Password");

            // write
            o.WriteTo(writer);



            }
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            throw new NotImplementedException("Unnecessary because we set CanRead to false so this method will never be called");
        }
    }
```

## Register the Converter

```csharp
services.AddControllers().AddNewtonsoftJson(
                options =>
                {
                    // add the converter to make the passwords null
                    options.SerializerSettings.Converters.Add(new UserConverter());
                }
            );
```
