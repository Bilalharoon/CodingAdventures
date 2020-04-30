---
title: Save Users to Database
date: 2020-04-22
tags:
    - dotnet
    - test
---

`version: 3.1`

## Hashing Passwords with Salt

Hashing is a process by which you encrypt a string in a way that it cannot be unencrypted without a lot of effort. **You should always hash your passwords before you store them in a database. Never store passwords in plain text** so that if the database is compromised you do not give away all your users passwords. Many people reuse the same password for multiple websites. If the attacker does gain access to your passwords he will be able try them on different accounts.

Salt is a random number added to the password before hashing to make it harder to brute force
If an attacker were to gain the hashed passwords, without the salt, he would have to do this:

    hash(guess) == hashedPassword

But if you add salt he has to do this:

    hash(guess + salt) == hashedPassword

This significantly reduces the time he has to figure out the password and gives you a chance to detect the breach and give a warning to all your users to change their passwords. Here is how to implement it in C#.

```csharp
// Hash the passwords
// format: HashedPassword:Salt
string Hash(string password, byte[] salt)
{
    string hashed = Convert.ToBase64String(
        // pbkdf2 is a hashing algortihim
        KeyDerivation.Pbkdf2(
        password: password,
        salt: salt,
        prf: KeyDerivationPrf.HMACSHA256,   // use Sha256
        iterationCount: 10000,
        numBytesRequested: 256 / 8));
    return hashed + ":" + Convert.ToBase64String(salt);
}

```

here we have a method that takes two parameters, the plain-text password and the salt and hashes them using the SHA-256 algorithm.

## Verify Hash

Because hashing is a one way process, we have to verify a hashed password by hashing the password given to us by the user with the same salt and see if they match.

```csharp
bool VerifyHash(string hash, string plainText)
{
    // seperate hash from salt
    string[] SplithashedPass = hash.Split(":");

    // convert salt to bytes
    byte[] salt = Convert.FromBase64String(SplithashedPass[1]);


    // hash the entered password with the same salt
    string userPassHash = Hash(plainText, salt);

    // check if the passwords match
    if (hash == userPassHash)
    {
        return true;
    }

    return false;

}

```

## Register Endpoint

This is the endpoint that the client will use to create a new user. You can seperate the logic out into a service layer if you want.

```csharp
[Route("Register")]
[HttpPost]
public IActionResult Register(UserModel user)
{
    if (!ModelState.IsValid)
    {
        return BadRequest();
    }

    // Generate random salt
    byte[] salt = new byte[128 / 8];
    using (var rng = RandomNumberGenerator.Create())
    {
        rng.GetBytes(salt); // populates the salt with random numbers
    }

    // save users to Database
    user.Password = Hash(user.Password, salt);
    _context.Add(user);
    _context.SaveChanges();

    // remove password before returning
    user.Password = null;
    return Ok(user);

}
```

## Login

Here is the login endpoint.

```csharp
[Route("login")]
[HttpPost]
public IActionResult Login(UserModel user)
{
    // Get user with same username and password
    var verifiedUser = _context.Users.AsEnumerable().SingleOrDefault(
        x => x.Username.ToUpper() == user.Username.ToUpper() && VerifyHash(x.Password, user.Password)
        );

    if (verifiedUser == null)
    {
        //throw exception
    }

    // authentication successful so generate jwt token
    string token = GenerateToken(verifiedUser);
    verifiedUser.Token = token;
    verifiedUser.Password = null;
    return Ok(verifiedUser);


}
```

## User Model

```csharp
public class UserModel
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }

    [NotMapped] // don't save this to the database
    public string Token { get; set; }
}

```
