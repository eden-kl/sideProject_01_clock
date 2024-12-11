$(function () {
    let setClockModal = $('#setClockModal');
    /**
     * 網頁起始 initial
     */
    calculatePage();    //計算頁面高度
    calculateSize();    //計算時鐘大小
    let date = getDate();   //取得現在日期
    $('.year').html(date['year']);  //設定年
    $('.month').html(date['month']);    //設定月
    $('.day').html(date['day']);    //設定日
    /**
     * 計算時間
     */
    let dayObj = new Date();
    let second = dayObj.getSeconds() * 6;   //360度 / 60秒：1秒轉6度
    let minute = dayObj.getMinutes() * 6 + (dayObj.getSeconds() * 6 / 60);  //1分轉6度，1秒轉0.1度
    let hour = dayObj.getHours() * 30 + (dayObj.getMinutes() * 6 / 12); //360度 / 12小時：1小時轉30度，1分鐘轉0.5度

    let root = document.documentElement;
    root.style.setProperty('--second-animate-start', (second + 45) + 'deg');    // +45度是因為，原始圖形分針是左斜45度
    root.style.setProperty('--second-animate-end', (second + 360 + 45) + 'deg');
    root.style.setProperty('--minute-animate-start', minute + 'deg');
    root.style.setProperty('--minute-animate-end', (minute + 360) + 'deg');
    root.style.setProperty('--hour-animate-start', hour + 'deg');
    root.style.setProperty('--hour-animate-end', (hour + 360) + 'deg');
    // 新增動畫
    $('.hour-body').addClass('hour-animate');
    $('.minute-body').addClass('minute-animate');
    $('.minute-line').addClass('minute-animate');
    $('.second-body').addClass('second-animate');

    /**
     * 自適應 responsive
     */
    $(window).on('resize', function () {
        calculatePage();    //計算頁面高度
        calculateSize();    //計算時鐘大小
    });

    /**
     * 設定modal開啟前，取得現在時間
     */
    setClockModal.on('show.bs.modal', function () {
        let dayObj = new Date();
        let second = dayObj.getSeconds();
        let minute = dayObj.getMinutes();
        let hour = dayObj.getHours();
        $('#hour').val(hour.toString().padStart(2, '0'));   //個位數時，前面補0
        $('#minute').val(minute.toString().padStart(2, '0'));   //個位數時，前面補0
        $('#second').val(second.toString().padStart(2, '0'));   //個位數時，前面補0
    });
    /**
     * 設定modal關閉後，清空資料
     */
    setClockModal.on('hidden.bs.modal', function () {
        $('#hour').val('');
        $('#minute').val('');
        $('#second').val('');
    });
    /**
     * 調整時間(確認按鈕)
     */
    setClockModal.on('click', '#setBtn', function () {
        let modal = bootstrap.Modal.getInstance($('#setClockModal'));
        let root = document.documentElement;
        let second = $('#second').val();
        let second_s = second * 6;  //360度 / 60秒：1秒轉6度
        let minute = $('#minute').val();
        let minute_s = minute * 6 + (second * 6 / 60);  //1分轉6度，1秒轉0.1度
        let hour = $('#hour').val();
        let hour_s = hour * 30 + (minute * 6 / 12); //360度 / 12小時：1小時轉30度，1分鐘轉0.5度
        root.style.setProperty('--second-animate-start', (second_s + 45) + 'deg');  // +45度是因為，原始圖形分針是左斜45度
        root.style.setProperty('--second-animate-end', (second_s + 360 + 45) + 'deg');
        root.style.setProperty('--minute-animate-start', minute_s + 'deg');
        root.style.setProperty('--minute-animate-end', (minute_s + 360) + 'deg');
        root.style.setProperty('--hour-animate-start', hour_s + 'deg');
        root.style.setProperty('--hour-animate-end', (hour_s + 360) + 'deg');
        // 刪除class以重整動畫
        $('.hour-body').removeClass('hour-animate');
        $('.minute-body').removeClass('minute-animate');
        $('.minute-line').removeClass('minute-animate');
        $('.second-body').removeClass('second-animate');
        // 延遲以重整動畫
        setTimeout(() => {
            $('.hour-body').addClass('hour-animate');
            $('.minute-body').addClass('minute-animate');
            $('.minute-line').addClass('minute-animate');
            $('.second-body').addClass('second-animate');
        }, 1);
        modal.hide();   //關閉modal
    });

    /**
     * 輸入檢測
     * 1.禁止托放
     * 2.僅可輸入數字
     * 3.自動補0
     * 4.自動全選
     * 5.從個位數開始輸入
     */
    let originValue;
    $('#hour, #minute, #second').on('keydown focus drop drag', function (event) {
        // 禁止托放
        if (event.type === 'drop' || event.type === 'drag') {
            return false;
        }
        if (event.type === 'focus') {
            // 第一次焦點時紀錄數值
            originValue = $(this).val();
        }else if (event.type === 'blur') {
            // 離開焦點時還原紀錄數值
            originValue = '';
            return;
        }
        // 輸入前全選
        $(this).one('mouseup', function (event) {
            event.preventDefault();
        }).select();
        // 僅可輸入數字和刪除、倒退
        let keyArray = '1234567890'.split('');  // 可輸入的char
        keyArray = keyArray.concat(['Delete', 'Backspace']);
        let flag = keyArray.filter((value) => {
            return event.key === value;
        });
        // 其他按鍵不做任何動作
        if (flag.length === 0) {
            return false;
        }
        if (event.type === 'keydown') {
            let flag = ['Delete', 'Backspace'].filter((value) => {
                return event.key === value;
            });
            if (flag.length === 0) {
                // 輸入數字時
                let value = parseInt($(this).val());
                let result;
                if ($(this).val() === originValue) {
                    // 第一次焦點輸入時，當作輸入個位數處理
                    result = '0' + event.key;
                }else {
                    // 其他
                    if (value < 10) {
                        // 原來值只有個位數時，將原來的數變為十位數，將要輸入的值為個位數
                        if (value === 0) {
                            // 0的時候為00
                            result = '0' + event.key;
                        }else {
                            // 其他數字
                            result = parseInt(event.key) + value * 10;
                            let id = $(this).attr('id');
                            //時：最大僅可輸入23
                            if (id === 'hour') {
                                if (result > 23) {
                                    result = 23;
                                }
                            }
                            //分、秒：最大僅可輸入59
                            if (id === 'minute' || id === 'second') {
                                if (result > 59) {
                                    result = 59;
                                }
                            }
                        }
                    }else {
                        // 個位數時，十位數補0
                        result = '0' + event.key;
                    }
                }
                // 填入數字
                $(this).val(result);
                // 填入後再次全選
                $(this).one('mouseup', function (event) {
                    event.preventDefault();
                }).select();
                return false
            }
        }
    });


    /**
     * 偵測日期(跨日)
     */
    setInterval(() => {
        // 計算日期
        let date = getDate();
        let year = $('.year');
        let month = $('.month');
        let day = $('.day');
        if (year.html() !== date['year'] || month.html() !== date['month'] || day.html() !== date['day']) {
            // 如果日期改變，將新日期寫入
            year.html(date['year']);
            month.html(date['month']);
            day.html(date['day']);
        }
    }, 1000);

    /**
     * 取得現在日期
     * @returns {{month: *, year: *, day: *}}
     */
    function getDate() {
        let d = new Date();
        let year = d.getFullYear().toString();
        let month = (d.getMonth() + 1) + '月';
        let day = (d.getDate()<10 ? '0' : '') + d.getDate();
        return {
            'year': year,
            'month': month,
            'day': day,
        }
    }

    /**
     * 計算頁高
     */
    function calculatePage() {
        let windowHeight = $(window).height();
        let wrapper = $('.wrapper');
        wrapper.css('min-height', windowHeight + 'px'); //滿版頁高
    }

    /**
     * 計算時鐘大小
     */
    function calculateSize() {
        let width = $(window).width() * 0.6;    //寬度占比60%
        let max = 350;  //最大不超過350px
        let min = 230;  //最小不超過230px
        let fontMax = 12;    //最大不超過12rem
        let fontMin = 7;    //最小不超過7rem
        let fontSize ;
        if (width >= max) {
            width = max;
            fontSize = fontMax;
        }else if (width <= min) {
            width = min;
            fontSize = fontMin;
        }else {
            fontSize = (fontMax - fontMin) * ((width - min) / (max - min)) + fontMin; // 依比例增減
        }
        let root = document.documentElement;
        root.style.setProperty('--clock-width', width + 'px');  //更改時鐘大小
        root.style.setProperty('--clock-font-size', fontSize + 'rem');  //更改字體大小
    }
});
