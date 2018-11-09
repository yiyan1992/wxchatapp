// pages/agreement/agreement.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    message:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var type = options.type;
    //根据不同type 1：借款合同 2：产品说明 3：自动还款协议
    wx.request({
      url: app.globalData.http_url_head + 'agreement/query/' + type,
      header: {
        token: app.globalData.userInfo.token
      },
      method: 'POST',
      success:function(res){
        if(res.statusCode == 200 && res.data.code == 0){
            that.setData({
              message:res.data.msg
            })
        }else{

        }
      },
      fail:function(){
        console.log("请求后台失败");
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})