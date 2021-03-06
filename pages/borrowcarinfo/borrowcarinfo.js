import WxValidate from '../../assets/plugins/wx-validate/WxValidate'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clRiskInfo: {},
    clCarInfo: {},
    carlist: [],
    dengjiList: [],
    xingshiList: [],
    accidentIndex: 0,
    accidentArray: [],
    hasIndex: 0,
    hasArray: ['否', '是'],
    biz_order_no: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    let biz_order_no = options.biz_order_no;
    let carlist = that.data.carlist;
    let dengjiList = that.data.dengjiList;
    let xingshiList = that.data.xingshiList;
    let accidentArray = that.data.accidentArray;
    let accidentIndex = that.data.accidentIndex;
    let clRiskInfo = that.data.clRiskInfo;
    let clCarInfo = that.data.clCarInfo;
    let hasIndex = that.data.hasIndex;
    that.initValidate();
    //请求后台获取相关信息
    wx.request({
      url: app.globalData.http_url_head + "borrow/toCarBorrow/" + biz_order_no,
      header: {
        token: app.globalData.userInfo.token
      },
      method: 'POST',
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          biz_order_no = res.data.dataMap.biz_order_no; //车辆基本信息
          if (biz_order_no != '' && biz_order_no != null) {
            clRiskInfo = res.data.dataMap.clRiskInfo; //风控信息，用于获取车辆估值
            let carList = res.data.dataMap.carList; //车辆照片
            let cardriveList = res.data.dataMap.driveList; //行驶证
            let registerList = res.data.dataMap.registerList //机动车登记证书
            clCarInfo = res.data.dataMap.clCarInfo
            for (let index in carList) {
              carlist[index] = carList[index].file_path
            }

            for (let index in cardriveList) {
              xingshiList[index] = cardriveList[index].file_path
            }

            for (let index in registerList) {
              dengjiList[index] = registerList[index].file_path
            }
            hasIndex = clCarInfo.major_accident;
            accidentIndex = clCarInfo.accident_type;
          }

          let accidentTypes = res.data.dataMap.accidentTypes;
          for (let index in accidentTypes) {
            accidentArray[index] = accidentTypes[index].label
          }

          that.setData({
            clRiskInfo: clRiskInfo,
            clCarInfo: clCarInfo,
            carlist: carlist,
            xingshiList: xingshiList,
            dengjiList: dengjiList,
            accidentArray: accidentArray,
            accidentIndex: accidentIndex,
            biz_order_no: options.biz_order_no,
            hasIndex: hasIndex,
          })
        }
      },
      fail: function() {
        console.log("获取后台失败！");
      }
    })
  },

  /**
   * 车辆照片预览
   */
  previewImageCar: function(e) {
    let currentUrl = e.target.dataset.src;
    if (currentUrl == '' || currentUrl == null) { //缺少图片
      this.chooseImg(7, );
    } else {
      wx.previewImage({
        current: currentUrl, // 当前显示图片的http链接
        urls: this.data.carlist // 需要预览的图片http链接列表
      })
    }
  },

  /**
   * 抵押登记证预览
   */
  previewImageDeng: function(e) {
    let currentUrl = e.target.dataset.src;
    if (currentUrl == '' || currentUrl == null) { //缺少图片
      this.chooseImg(4);
    } else {
      wx.previewImage({
        current: currentUrl, // 当前显示图片的http链接
        urls: this.data.dengjiList // 需要预览的图片http链接列表
      })
    }
  },

  /**
   * 行驶证预览
   */
  previewImageXing: function(e) {
    let currentUrl = e.target.dataset.src;
    if (currentUrl == '' || currentUrl == null) { //缺少图片
      this.chooseImg(14);
    } else {
      wx.previewImage({
        current: currentUrl, // 当前显示图片的http链接
        urls: this.data.xingshiList // 需要预览的图片http链接列表
      })
    }
  },

  /**
   * 缺少图片上传图片公用方法
   */
  chooseImg: function(file_type) {
    let that = this;
    let carlist = that.data.carlist;
    let dengjiList = that.data.dengjiList;
    let xingshiList = that.data.xingshiList;
    wx.chooseImage({
      count: 1, //一次只允许一张
      sizeType: ['original', 'compressed'], //可选择原图或缩略图
      sourceType: ['album', 'camera'], //访问相册、相机
      success: function(res) {
        let tempFilePaths = res.tempFilePaths;
        //图片上传
        wx.uploadFile({
          url: app.globalData.http_url_head + 'attachmentInfo/uploadFile',
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            "Content-Type": "multipart/form-data",
            token: app.globalData.userInfo.token
          },
          formData: {
            file_type: file_type,
            biz_order_no: that.data.biz_order_no,
            formType: 0
          },
          success: function(res) {
            let data = JSON.parse(res.data);
            if (res.statusCode == 200 && data.code == 0) {
              if (file_type == 7) { //车辆照片
                carlist[carlist.length] = data.entity.file_path;
                that.setData({
                  carlist: carlist
                })
              } else if (file_type == 4) { //抵押登记照片
                dengjiList[dengjiList.length] = data.entity.file_path;
                that.setData({
                  dengjiList: dengjiList
                })
              } else {
                xingshiList[xingshiList.length] = data.entity.file_path;
                that.setData({
                  xingshiList: xingshiList
                })
              }
            }
          },
          fail: function() {
            console.log("身份证照上传失败！");
          }
        })
      },
    })
  },

  /**
   * 下一步
   */
  formSubmit: function(e) {

    let data = e.detail.value

    // 传入表单数据，调用验证方法
    if (!this.WxValidate.checkForm(data)) {
      const error = this.WxValidate.errorList[0]
      wx.showToast({
        title: error.msg,
        icon: 'none',
        duration: 2000 //持续的时间
      })
      return false
    }

    //先检查图片是否存在
    if (this.data.carlist.length < 1 || this.data.dengjiList.length < 1 || this.data.xingshiList.length < 2) {
      wx.showToast({
        title: '缺少图片信息，请上传图片',
        icon: 'none',
        duration: 2000 //持续的时间
      })
      return false
    }


    let that = this;
    let nextUrl = ''
    //后台保存数据
    wx.request({
      url: app.globalData.http_url_head + 'borrow/saveCarInfo',
      header: {
        token: app.globalData.userInfo.token
      },
      data: {
        data: data
      },
      method: "post",
      success: function(res) {
        if (res.statusCode == 200 && res.data.code == 0) {
          if (res.data.msg == 0) {
            nextUrl = '../faceValidate/faceValidate?biz_order_no=' + that.data.biz_order_no
          } else {
            nextUrl = '../sign/sign?biz_order_no=' + that.data.biz_order_no + '&page_type=1&channel_type=1'
          }
          wx.navigateTo({
            url: nextUrl
          })
        }
      },
      fail: function() {
        console.log("数据保存失败")
      }
    })
  },

  initValidate() {
    // 验证字段的规则
    const rules = {
      car_no: {
        required: true,
      },
      car_brand: {
        required: true,
      },
      car_model: {
        required: true,
      },
      car_cost: {
        required: true,
      },
      car_color: {
        required: true,
      },
      car_frame_no: {
        required: true,
      },
      car_engine_no: {
        required: true,
      },
      car_service_life: {
        required: true,
      },
      car_driving_mileage: {
        required: true,
      },
    }

    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      car_no: {
        required: '车牌号码不能为空',
      },
      car_brand: {
        required: "车辆品牌不能为空",
      },
      car_frame_no: {
        required: "车架号不能为空",
      },
      car_color: {
        required: "车辆颜色不能为空",
      },
      car_driving_mileage: {
        required: "车辆行驶里程不能为空",
      },
      car_engine_no: {
        required: "发动机号不能为空",
      },
      car_model: {
        required: "车辆型号不能为空",
      },
      car_service_life: {
        required: "车辆使用年限不能为空",
      },
      car_cost: {
        required: "车辆估值不能为空",
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },

  /**
   * 选择监听
   */
  bindhasChange: function(e) {
    this.setData({
      hasIndex: e.detail.value
    })
  },
  bindaccidentChange: function(e) {
    this.setData({
      accidentIndex: e.detail.value
    })
  },

})