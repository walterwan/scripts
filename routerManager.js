// ==UserScript== 
// @name            GIS-R20 Gateway User manager
// @namespace    https://github.com/walterwan
// @description     Move high-usage user to a specific WAN
// @match           http://10.6.16.1/admin/connected.cgi*
// @run-at          document-start
// @version         1.0
// ==/UserScript==

(function () {
    window.addEventListener('keydown', onKeyDown)
    var rescanIntervel = 60000

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        onReady()
    } else {
        document.addEventListener("DOMContentLoaded", onReady)
    }

    function onReady() {
        scanUser()
        intervalScan = setInterval(scanUser, rescanIntervel);
        document.removeEventListener("DOMContentLoaded", onReady)
    }

    function onKeyDown(event) {
        if (!event.altKey) {
            return true
        }

        pressedNum = event.keyCode
        console.log(pressedNum)

        if (pressedNum == 65) {
            scanUser()
            // intervalScan = setInterval(scanUser, rescanIntervel);
        }
        
        if (pressedNum == 83) {
            console.log('Auto Scan Stoped')
            clearInterval(intervalScan)
        }
            
            
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
    }

    function scanUser() {
        console.clear()
        console.log('Re-scan in ', rescanIntervel/1000, ' sec')
        
        var whiteListMac = ["dc:85:de:78:84:4d", "f8:e0:79:c9:e5:b2", "e8:94:f6:0b:f6:3a"]
        var numSlowWan = 2
        var numFastWan = 1
        var numUser = document.querySelectorAll('table')[4].querySelectorAll('tr').length - 1 
        var byteLimit = 600000000
        
        loopUser:
        for (var i = 1; i < numUser + 1; i++) {
            var ip = document.querySelectorAll('table')[4].querySelectorAll('tr')[i].querySelectorAll('td')[2].textContent
            var mac = document.querySelectorAll('table')[4].querySelectorAll('tr')[i].querySelectorAll('td')[1].textContent
            var buttonWan = document.querySelectorAll('table')[4].querySelectorAll('tr')[i].querySelectorAll('td')[6].querySelector('a')
            var wanNum = buttonWan.querySelector('u').textContent
            var buttonLogout = document.querySelectorAll('table')[4].querySelectorAll('tr')[i].querySelectorAll('td')[7].querySelectorAll('a')[0]
            var bytes = document.querySelectorAll('table')[4].querySelectorAll('tr')[i].querySelectorAll('td')[4].textContent
            var regexObj = /(\d+[\sKMG])/
            var byteDownloaded = bytes.match(regexObj)[0]
            
            switch (byteDownloaded[byteDownloaded.length - 1]) {
                case "\s":
                    byteDownloaded = byteDownloaded.slice(0, -1)
                case "K":
                    byteDownloaded = byteDownloaded.slice(0, -1)*1000
                    break
                case "M":
                    byteDownloaded = byteDownloaded.slice(0, -1)*1000000
                    break
                case "G":
                    byteDownloaded = byteDownloaded.slice(0, -1)*1000000000
                    break
            }
            
            // check if the MAC is in admin MAC list
            for (var j = 0; j < whiteListMac.length; j++) {
                if (mac == whiteListMac[j]) {
                    if (wanNum == numSlowWan) {
                        buttonWan.click()
                    }
                    continue loopUser 
                }
            }
            
            // switch to slow WAN if the user reached their download limit
            if (byteDownloaded > byteLimit && wanNum == numFastWan) {
                buttonWan.click()
                console.log('Change WAN for ip: ', ip)
            }
            
            if (byteDownloaded > byteLimit) {
                console.log('i = ', i, 'Bytes = ', byteDownloaded/1000000000, 'G', 'MAC = ', mac, 'WAN = ', wanNum)
            }
        }
    }
    
    function createArray(length) {
    var arr = new Array(length || 0),
        i = length
        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while(i--) arr[length-1 - i] = createArray.apply(this, args);
        }
    
        return arr;
    }
    
})()