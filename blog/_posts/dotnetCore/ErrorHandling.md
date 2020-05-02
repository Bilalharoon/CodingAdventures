---
title: Handling Errors
date: 2020-04-22
tags:
    - dotnet
    - error
---

`version: 3.1`

## Create an exception

This is just a basic exception class

```csharp
public class HttpResponseException:Exception
    {
        public HttpResponseException(string value)
        {
            Value = value;
        }
        public int Status { get; set; } = 400;  // The http response code status
        public string Value { get; set; }   // The message we want to send
    }
```

## Create a filter for the exception

```csharp
    class HttpResponseExceptionFilter : IActionFilter, IOrderedFilter
    {
        // This method will be called after the action is excecuted
        public void OnActionExecuted(ActionExecutedContext context)
        {
            // if the exception is an HttpResponseException
            if (context.Exception is HttpResponseException exception)
            {
                // set the result
                context.Result = new ObjectResult(exception.Value)
                {
                    StatusCode = exception.Status,

                };
                context.ExceptionHandled = true;
            }
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            // nothing here
        }

        // The order which this Filter will be excecuted
        public int Order { get; } = 1000;
    }
```

## Register the filter

```csharp
 services.AddControllers(
            options => {
                options.Filters.Add(new HttpResponseExceptionFilter());
            }
        )
```

## Throw the exception

```csharp
 public UserModel GetById(int id){

     // get the user
     var user = _context.Users.SingleOrDefault(u => u.Id == id);

     if(!user){ // if we didn't find the user throw an exception
         throw new HttpResponseException("Couldn't find user with that Id")
     }
 }
```
