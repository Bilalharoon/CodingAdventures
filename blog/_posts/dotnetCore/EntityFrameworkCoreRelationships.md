---
title: Table Relationships in Entity Framework Core
date: 2020-04-22
tags:
    - dotnet
---

`version 3.1.3`

## One to many

In a one to many relationship their is a parent table and a child table. The child table contains a column which refrences a row of the parent. This is called a foreign key.

```csharp

// Parent
public class Profile {

  public int Id { get; set; }
  public string Name { get; set; }
  public bool Gender { get; set; }

  // Doesn't go in Database, just for code
  public List<Post> Posts { get; set; }
}

// Child
public class Post {

  public int Id {get; set}
  public string Text { get; set; }
  public DateTime PostedOn { get; set; }

  // The foreign key
  public int ProfileId { get; set; }

  // Also doesn't go in Database, just to make it easier in C#
  public Profile profile { get; set; }
}
```

## Many to Many

As of this efcore version, their is no way to do a many-to-many relationship without a join table. A join table is a table that holds a foreign key to both of the other tables.

Let's say we have a data model like this:

```csharp
public class Student {

   public int id { get; set; }

   public string Name { get; set; }

 }

public class Course {

   public int id { get; set; }

   public string Name { get; set; }

   public string Description { get; set; }
 }

```

To create a many to many relationship we would have to create a join table that both `Student` and `Courses` have a one to many relationship with. Each row in the `StudentCourses` table will hold a foreign key to the Student and to the Course tables.

```csharp
public class Student {

   public int id { get; set; }

   public string Name { get; set; }

  public List<StudentCourses> StudentCourses { get; set; }
 }

public class StudentCourse {

   public int id { get; set; }

   public Student Student { get; set }
   public int StudentId { get; set; }

   public Course Course { get; set; }
   public int CourseId { get; set; }
 }

public class Course {

   public int id { get; set; }

   public string Name { get; set; }

  public string Description { get; set; }

  public List<StudentCourses> StudentCourses { get; set; }

 }
```

## Skip level Navigation

What if we wanted to easily access all the courses that a student was attending without having to use some fancy `join` command. That is called skip level navigation and to add it we have to enable lazy loading. Lazy loading allows you to get all the data whenever you call for it, and not when it is returned to the client which is the default behavior.

To enable lazy loading you need to install

    Microsoft.EntityFrameworkCore.Proxies

Once you have that installed go into your `ApplicationDbContext` file and add this:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder){
            optionsBuilder.UseLazyLoadingProxies()
}
```

Now we can just make any field in our data model virtual and it will load whenever we call it

```csharp
public class Student {

   public int id { get; set; }

   public string Name { get; set; }

  [JsonIgnore]
  public virtual List<StudentCourses> StudentCourses { get; set; }

  // Grab all the courses from the StudenCourses and convert them into a list
  [NotMapped]
  public List<Course> Courses => StudentCourse.select(sc => sc.Course).ToList();
 }

public class StudentCourse {

   public int id { get; set; }

   public virtual Student Student { get; set }
   public int StudentId { get; set; }

   public virtual Course Course { get; set; }
   public int CourseId { get; set; }
 }

public class Course {

   public int id { get; set; }

   public string Name { get; set; }

  public string Description { get; set; }

  [JsonIgnore]
  public virtual List<StudentCourses> StudentCourses { get; set; }

  // Grab all the students from the StudentCourses and convert it to a list
  [NotMapped]
  public virtual List<Student> Students => StudentCourse.select(sc => sc.Student).ToList();

 }
```

Now we can just access it by doing

```csharp
  var student = new Student();
  Console.Writeline(student.Courses); // gets all the courses that belongs to the student

  var course = new Course();
  Console.WriteLine(course.Students) // gets all the students that belong to that course

```
