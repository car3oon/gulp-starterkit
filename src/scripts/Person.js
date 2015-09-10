class Person
{
  constructor(firstName)
  {
    this.firstName = firstName;
    console.log('Person::constructor - sample ES6 - file 2');
  }
  sayName()
  {
    console.log("sup: ", this.firstName);
  }
}
