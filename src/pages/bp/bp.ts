import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {DateTime, IonicPage, NavController, NavParams} from 'ionic-angular';
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {PatientServiceProvider} from "../../providers/patient-service/patient-service";
import {PhysiologyServiceProvider} from "../../providers/physiology-service/physiology-service";

import Highcharts from "highcharts";
import HighchartsNoData from 'highcharts-no-data-to-display';
/**
 * Generated class for the BpPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bp',
  templateUrl: 'bp.html',
})
export class BpPage{



  @ViewChild('chartBar') chartBar: ElementRef;

  /*根据服务存储病人列表*/
  private patients:any;
  /*控制当前按钮的颜色*/
  public btnStyle:string[]=new Array(1);
  /*当前点击的按钮是那个*/
  public btnIsVisited:number;
  /*默认展示曲线图*/
  public chooseType:String='curve';
  /*后台返回的血压数据*/
  public  bloodPressures= new Array();
  /*时间标签*/
  public timeLabel= new Array();
  /*血压值中的具体数据*/
  public bloodPressureValues_1 = new Array();
  public bloodPressureValues_0 = new Array();

  /*曲线的开始时间*/
  private curve_startTime:any;

  /*开始时间\统计列表时间*/
  public startTime:any;
  /*结束时间\统计列表时间*/
  public endTime :any;




  /*测试阶段用用户ID号为72*/
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public userService: UserServiceProvider,
              public patientService:PatientServiceProvider,
              public physiologyService:PhysiologyServiceProvider) {

    /*初始化开始时间和结束时间*/
    this.initialTimeInput();



    /*首先获取当前用户关注的病人*/
    this.patientService.getPatientsByUserId(this.userService.user['userId'],data=>{
      if(data.hasOwnProperty("success")){
        this.patients = data["success"];
        this.btnStyle=new Array(this.patients.length);
        /*默认是访问第一个数据*/
        this.btnStyle[0]="btn_visited";
        this.btnIsVisited=0;
        /*病人的基本数据传递过来之后，显示第一病人今天的数据*/
        let _startTime=new Date(this.startTime);
        let _endTime = new Date(_startTime.getTime()+1000*60*60*24);
        this.getBloodPressureDateOfDuringTime(this.patients[0]["patientId"],_startTime,_endTime,'curveType');
      }
      else{
        console.log("获取当前用户关注病人信息失败");
      }
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BpPage');
  }

  /*当前选中的病人*/
  public getPatientInfo(num:number){
   this.btnStyle[num]="btn_visited";
   this.btnStyle[this.btnIsVisited]="";
   this.btnIsVisited=num;
   let _startTime=new Date(this.startTime);
   let _endTime = new Date(_startTime.getTime()+1000*60*60*24);
   this.getBloodPressureDateOfDuringTime(this.patients[0]["patientId"],_startTime,_endTime,'curveType');
  }


  /*改变选中的条件(曲线、统计、列表) ，然后获取病人ID号，开始时间和结束时间得到病人在该段时间内的血压值*/
  public changeChooseType(type:string) {
    this.chooseType=type;
    if(type=="curve"){
      let _startTime=new Date(this.curve_startTime);
      let _endTime = new Date(_startTime.getTime()+1000*60*60*24);
      this.getBloodPressureDateOfDuringTime(this.patients[this.btnIsVisited]["patientId"],_startTime,_endTime,'curveType');
    }
    if(type=='statistics'){
      let _startTime = new Date(this.startTime);
      let _endTime = new Date(this.endTime);
      this.getBloodPressureDateOfDuringTime(this.patients[this.btnIsVisited]["patientId"],_startTime,_endTime,'statisticsType');
    }
  }



  /*根据病人的ID号筛选时间，获取病人在该时间段的血压值*/
  public  getBloodPressureDateOfDuringTime(patiantId:number,_startTime:Date,_endTime:Date,selectType:string){
    this.physiologyService.getBloodPressureData(patiantId,_startTime,_endTime,data=>{
      if(data.hasOwnProperty("success")){
        this.bloodPressures=data["success"];
        this.mapBloodPressures(selectType);
      }
      else {
        this.bloodPressures=null;
        console.log(data["error"]);
      }
    });
  }


  /*初始化时间选择框*/
  public initialTimeInput(){
    /*getMonth 返回值是从0 到 11*/
    let _startTime =new Date();
    let _startTimeMonth= _startTime.getMonth()+1>=1&&_startTime.getMonth()+1<=9?0+""+(_startTime.getMonth()+1):_startTime.getMonth()+1;
    let _startTimeDay =  _startTime.getDate()>=1&&_startTime.getDate()<=9?0+""+_startTime.getDate():_startTime.getDate();
    this.startTime=_startTime.getFullYear()+"-"+_startTimeMonth+"-"+_startTimeDay;
    this.curve_startTime =_startTime.getFullYear()+"-"+_startTimeMonth+"-"+_startTimeDay;
    _startTime.setMilliseconds(0);
    _startTime.setSeconds(0);
    _startTime.setMinutes(0);
    _startTime.setHours(0);
    let _endTime = new Date(_startTime.getTime()+1000*60*60*24);
    let _endTimeMonth = _endTime.getMonth()>=1+1&&_endTime.getMonth()+1<=9?0+""+(_endTime.getMonth()+1):_endTime.getMonth()+1;
    let _endTimeDay =  _endTime.getDate()>=1&&_endTime.getDate()<=9?0+""+_endTime.getDate():_endTime.getDate();
    this.endTime=_endTime.getFullYear()+"-"+_endTimeMonth+"-"+_endTimeDay;

  }


  /*血压数据中的遍历,重新画图*/
  public mapBloodPressures(mapType:string){

    if(mapType=='curveType'){
      this.timeLabel = new Array();
      this.bloodPressureValues_1=new Array();
      this.bloodPressureValues_0=new Array();
      for(let bloodPressure of this.bloodPressures){
        if(bloodPressure["type"]==1){
          this.bloodPressureValues_1.push(bloodPressure["value"]);
          this.timeLabel.push(bloodPressure['time'].toString().split("T")[1]);
        }
        if(bloodPressure["type"]==0){
          this.bloodPressureValues_0.push(bloodPressure["value"]);
        }

      }
      this.drawGraph();
    }
    if(mapType=="statisticsType"){
      this.timeLabel = new Array();
      this.bloodPressureValues_1=new Array();
      this.bloodPressureValues_0=new Array();
      for(let bloodPressure of this.bloodPressures){
        if(bloodPressure["type"]==1){
          this.bloodPressureValues_1.push(bloodPressure["value"]);
          this.timeLabel.push(bloodPressure['time'].toString().split("T")[1]);
        }
        if(bloodPressure["type"]==0){
          this.bloodPressureValues_0.push(bloodPressure["value"]);
        }

      }
      this.drawGraph_statistics();
    }

  }

  /*画图*/
  public  drawGraph(): void {
    HighchartsNoData(Highcharts);
    Highcharts.setOptions({
      lang: {
        noData: '暂无数据'
      }
    });

    var chart = Highcharts.chart('container', {
      title: {
        text: '病人的血压值'
      },
      xAxis:{
        title:{
          text:'时间'
        },
        enabled:false,
        labels: {    //刻度居中显示
          align: 'center'
        },
        categories:this.timeLabel, //对数据进行分类
        crosshair: {  //点击显示十字线格子
          width: 1,
          color: 'green'
        },
        gridLineWidth:1
      },
      yAxis: {
        title: {
          align: 'high',
          offset: -60,
          text: '血压值 (mm Hg)',
          rotation: 0,
          y: -20
        },
        plotLines:[{
          color:'red',           //线的颜色，定义为红色
          dashStyle:'solid',     //默认值，这里定义为实线
          value:120,               //定义在那个值上显示标示线，这里是在x轴上刻度为3的值处垂直化一条线
          width:1                //标示线的宽度，2px
        },
          {
            color:'yellow',           //线的颜色，定义为红色
            dashStyle:'solid',     //默认值，这里定义为实线
            value:80,               //定义在那个值上显示标示线，这里是在x轴上刻度为3的值处垂直化一条线
            width:1                //标示线的宽度，2px
          }],
        min:0,
        allowDecimals:true,
        crosshair: {
          width: 1,
          color: 'green'
        },
        tickAmount: 6
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
      },
      series: [{
              name: '某个时间段收缩压',
              data: this.bloodPressureValues_1,
              color:"blue"
                },
              { name:'某个时间段舒张压',
                data:this.bloodPressureValues_0,
                color: '#FF0000'
              }],
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }]
      }
      ,noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#303030'
        }
      }
    });
  }


  /*统计画图*/
  public  drawGraph_statistics(): void {
    HighchartsNoData(Highcharts);
    Highcharts.setOptions({
      lang: {
        noData: '暂无数据'
      }
    });

    var chart = Highcharts.chart('container_statistics', {
      title: {
        text: '病人的血压值'
      },
      xAxis:{
        title:{
          text:'时间'
        },
        enabled:false,
        labels: {    //刻度居中显示
          align: 'center'
        },
        crosshair: {  //点击显示十字线格子
          width: 1,
          color: 'green'
        },
        gridLineWidth:1
      },
      yAxis: {
        title: {
          align: 'high',
          offset: -60,
          text: '血压值 (mm Hg)',
          rotation: 0,
          y: -20
        },
        plotLines:[{
          color:'red',           //线的颜色，定义为红色
          dashStyle:'solid',     //默认值，这里定义为实线
          value:120,               //定义在那个值上显示标示线，这里是在x轴上刻度为3的值处垂直化一条线
          width:1                //标示线的宽度，2px
        },
          {
            color:'yellow',           //线的颜色，定义为红色
            dashStyle:'solid',     //默认值，这里定义为实线
            value:80,               //定义在那个值上显示标示线，这里是在x轴上刻度为3的值处垂直化一条线
            width:1                //标示线的宽度，2px
          }],
        min:0,
        allowDecimals:true,
        crosshair: {
          width: 1,
          color: 'green'
        },
        tickAmount: 6
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
      },
      series: [{
        name: '某个时间段收缩压',
        data: this.bloodPressureValues_1,
        color:"blue"
      },
        { name:'某个时间段舒张压',
          data:this.bloodPressureValues_0,
          color: '#FF0000'
        }],
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }]
      }
      ,noData: {
        style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#303030'
        }
      }
    });
  }
}
