export class  User{
  private name:String;
  private password:String;
  private sex:String;
  private phone:String;
  private address:String;

  constructor(){}


  get _phone(): String {
    return this.phone;
  }
}
