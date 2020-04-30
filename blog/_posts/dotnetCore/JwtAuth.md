---
title: Authenticate Users With a JWT Token
date: 2020-04-22
tags:
    - dotnet
    - test
---

`version: 3.1`

If you haven't read it, check out my article on [Registering users](/2020/04/21/RegisterUsers/) before you read this. Or don't, I can't tell you what to do.

A JWT (Json Web Token) is a token generated from a secret key that holds information about the user that we can use to verify the token.

The token is formatted like this: `header.payload.signature`.

`header`: Contains metadata like the issuer and expiration date.

`payload`: Contains claims about the user. Claims are just information about the user like the username, id and role.

`signature`: The header + payload encrypted with a secret key which is used to verify the user so that if someone changes the information in the payload he invalidates the signature.

[jwt.io](http://jwt.io)

## Dependencies

    Microsoft.AspNetCore.Authentication.JwtBearer

## Secret Key

Go into your `appsettings.json` and add your secret key, make sure it is long and secure.

```json
"key":"{{Your Secret key}}"
```

## Add Jwt Authentication middleware

Here we add the middleware to authenticat the user's token

```csharp
public void ConfigureServices(IServiceCollection services)
{
  services.AddControllers();

  // inject config
  services.AddSingleton(Configuration);

  // Inject DbContext
  services.AddDbContext<ApplicationDbContext>();

  // Turn the key into bytes
  var secretBytes = Encoding.UTF8.GetBytes(Configuration.GetSection("key").Value);

  // Use the bytes to create the key
  var key = new SymmetricSecurityKey(secretBytes);



  services.AddAuthentication("OAuth")
      .AddJwtBearer("OAuth", config => {

          // What we want to validate in our token
          config.TokenValidationParameters = new TokenValidationParameters() {

              ValidIssuer = "localhost",  // The valid key issuer
              ValidAudience = "localhost",  // The valid client
              IssuerSigningKey = key, // The valid key

          };
  });


}
```

## Generate Token

This method will generate to JWT token.

```csharp
private string GenerateToken(UserModel user)
{
  // store info about user here
  var claims = new[]
  {
      new Claim(ClaimTypes.Name, user.Username),

      // uncomment the line under this if you want to implement user roles
      // new Claim(ClaimTypes.Role, user.Role)

  };

  // get the key from appsettings.json
  var keyString = _config.GetSection("key").Value;

  // Turn the secret key into a string of bytes
  var secretBytes = Encoding.UTF8.GetBytes(keyString);

  // Turn bytes into signiture so middleware can verify token
  var key = new SymmetricSecurityKey(secretBytes);

  // Use the key to create the signature
  var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

  // Create the Token with the credentials
  var token = new JwtSecurityToken(
          issuer: "localhost",
          audience: "localhost",
          claims: claims,
          notBefore: DateTime.Now,
          expires: DateTime.Now.AddHours(3),  // The token will expire in three hours
          signingCredentials: signingCredentials
      );

  // turn token into a string
  var tokenJson = new JwtSecurityTokenHandler().WriteToken(token);

  // return the token
  return tokenJson;
}
```

## Login User

This Action handles User Login

```csharp
[Route("Login")]
[HttpPost]
public IActionResult Login(UserModel user)
{

  // query the user with the same username and password hash as the input
  var verifiedUser = _context.Users.AsEnumerable().SingleOrDefault(
    x => x.Username.ToUpper() == user.Username.ToUpper() && VerifyHash(x.Password, user.Password));

  // throw if user is not found
  if (verifiedUser == null)
      throw new ArgumentException("Username or Password is incorrect")

  // authentication successful so generate jwt token
  verifiedUser.Token = GenerateToken(verifiedUser);

  // remove password before returning
  verifiedUser.Password = null;

  return Ok(verifiedUser);
}
```

## Authorize a endpoint or controller with this attribute

```csharp
[Authorize( AuthenticationSchemes = "OAuth", Role=Roles.Admin)]
```

## Get User Claims in endpoints

```csharp
[HttpGet]
[Authorize(Roles="user")]
public string GetName(){  // gets the name of the current user from the jwt token
  return User.FindFirst(ClaimTypes.Name).Value
}
```

If you want to know how to save users to the database check out [This article](/2020/04/21/registerusers/)
