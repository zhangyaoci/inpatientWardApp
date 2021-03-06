import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {IonicPage, MenuController, NavController, NavParams} from 'ionic-angular';
import {InformationServiceProvider} from "../../providers/information-service/information-service";
import {NewInfoPage} from "../new-info/new-info";
import {UserServiceProvider} from "../../providers/user-service/user-service";

/**
 * Generated class for the NewsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-news',
  templateUrl: 'news.html',
})
export class NewsPage {

  private informationOption = "sysInfo";


  /*保存当前的消息*/
  private informations = [];
  private systemInformations = [];
  private doctorInformaions = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public informationService: InformationServiceProvider,
              public userService: UserServiceProvider) {
    this.initialInformationData();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewsPage');
  }


  /*字符串时间格式，返回与当前时间的差值*/
  public timeDifferenceForNow(time: any) {
    let timeOfNow = new Date();
    let timeOfInformation = new Date(time);
    //console.log("时间格式化",timeOfInformation);
    // console.log("时间差",Math.abs(timeOfNow.getTime()-timeOfInformation.getTime()));

    let timeDifference = Math.abs(timeOfNow.getTime() - timeOfInformation.getTime());
    let difference: any;

    if (timeDifference / 60000 < 1) {
      difference = "刚刚";
    }
    else if (timeDifference / 60000 >= 1 && timeDifference / 60000 < 60) {
      difference = Math.ceil(timeDifference / 60000) + "分钟前";
    }
    else if (timeDifference / 3600000 >= 1 && timeDifference / 3600000 < 24) {
      difference = Math.ceil(timeDifference / 3600000) + "小时前";
    }
    else if (timeDifference / (3600000 * 24) >= 1 && timeDifference / (3600000 * 24) < 365) {
      difference = Math.ceil(timeDifference / (3600000 * 24)) + "天前";
    }
    else {
      difference = Math.ceil(timeDifference / (3600000 * 24 * 365)) + "年前";
    }
    return difference;
  }


  /*跳转到消息的具体页面,消息是否已读*/
  public readingSysInfo(information: any) {
    if (information["isRead"] == 0) {
      this.informationService.updateReadingState(
        this.userService.user["userId"], information["informationId"], data => {
          if (data.hasOwnProperty("success")) {
            information["isRead"] = 1;
            /*及时更新到本地数据库*/
            this.navCtrl.push(NewInfoPage, information);
          }
          console.log(data["errror"]);
        });
    }
    else {
      this.navCtrl.push(NewInfoPage, information);
    }
  }


  /*向下拉取刷新页面*/
  doRefresh(refresher) {
    //console.log('Begin async operation', refresher);


    setTimeout(() => {
      // console.log('Async operation has ended');
      this.informationService.getInformation(this.userService.user['userId'],data=>{
        this.initialInformationData();
      });
      refresher.complete();
    }, 2000);
  }


  /*初始化消息数据*/
  private initialInformationData(){
    this.systemInformations=[];
    this.doctorInformaions=[];
    /*在进入该页面之前，就已经在tabPage中获取了消息的数据*/
    this.informations = this.informationService.informations;
    for (let information of this.informations) {
      /*改变时间的显示格式*/
      information["timeTransform"] = this.timeDifferenceForNow(information["time"])
      /*information["isRead"]=0;*/

      /*区分是系统消息，还是医嘱*/
      if (information["doctor"] == null) {
        this.systemInformations.push(information);
      }
      else {
        this.doctorInformaions.push(information);
      }
    }
  }


  private delete_new(new_information:any){
    this.informationService.deleteInformationState(this.userService.user["userId"], new_information["informationId"],data=>{
     if(data.hasOwnProperty("success")){
       this.informationService.getInformation(this.userService.user['userId'],data=>{
         this.initialInformationData();
       });
     }
     else {
       console.log("删除消息",data);
     }
    });
  }
}
