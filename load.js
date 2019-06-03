let $ = require('jquery')
const exec = require('child_process').exec;
let monitors_Group = [];




$(document).ready(function(){
    $('#reload-bt').click();
})

$('#reload-bt').on('click', () => {
    $("#monitor-group").html(`<center>
    <div class = "preloader-wrapper small active">
        <div class = "spinner-layer spinner-blue-only">
           <div class = "circle-clipper left">
              <div class = "circle"></div>
           </div>
           
           <div class = "gap-patch">
              <div class = "circle"></div>
           </div>
           
           <div class = "circle-clipper right">
              <div class = "circle"></div>
           </div>
        </div>
     </div>
    </center>`);
    load_current_display();
    M.toast({html: 'Actived monitors has been loaded', classes: 'rounded'});
})


function updateMonitorList(mon_data) {
    let updated_data = "";
    mon_data.forEach(element => {
        updated_data += `
        <li class="collection-item avatar">
        <img src="images/icons8-linux-server-80.png" alt="" class="mon-icon responsive-img"> 
        <span class="title">`+
        element["interface"]
        +
        `</span> 
        <p> Resolution: `+
        element["res"]
        +
        `&nbsp;&nbsp;&nbsp;Screen size: `
        +
        element["len"] 
        +
        `<br>`;

        if (element["primary"]==true)
            updated_data += "<div class='chip chipcolor'> Primary </div>";
            else
            updated_data += "<br>"
        
        updated_data +=
        `</p> 
        <div class="secondary-content ">
        <a class="waves-effect waves-light blue btn-small collapsible">
        <font color="white">Modes</font>
        </a>
        <a class="waves-effect waves-light green btn-small fix-collapsible">
        <font color="white">  <i class="material-icons medium">add</i>
        </font>
        </a>
        </div>
        <div class="content">
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </div>
        </li>`;
    });
    $('#monitor-group').html(updated_data);
}

function newMode_handler(evt) {
    var elem= document.querySelector('.modal');
    var instance = M.Modal.init(elem);
    instance.open();
    console.log(monitors_Group[evt.currentTarget.i]["interface"]);
    $("#mon-title").html("<div class='dialog_dname'>&nbsp;" + monitors_Group[evt.currentTarget.i]["interface"] + "</div>");
}

function regNewMode() {
    var coll = document.querySelectorAll('.fix-collapsible');
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].i = i;
        coll[i].addEventListener("click", newMode_handler, false);
    }
}

function expandList() {
    var coll = document.querySelectorAll('.collapsible');
    var i;

    for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.parentNode.nextElementSibling;
        if (content.style.maxHeight){
        content.style.maxHeight = null;
        } else {
        content.style.maxHeight = content.scrollHeight + "px";
        } 
    });
    }
}

function execute(command, callback) {
    exec(command, (error, stdout, stderr) => { 
        callback(stdout); 
    });
}


function check_line_num(str){
    lines = str.split(/\r\n|\r|\n/);
    return lines.length;
}

function updateResList(res_data){
    res_data.forEach((element, index) => {
        var dom = document.getElementsByClassName("content")[index];
        dom.innerHTML = element;
    });
}

// init - check monitors
function load_current_display(){
    execute('xrandr --listmonitors', (output) => {
        spilt_result = output.split("\n");
        total_monitors = spilt_result[0].split(" ")[1];
        var monitor_array = [];
        for(var i=0; i< total_monitors; ++i){
            var mon_info = [];
            var result_temp = spilt_result[i+1].split(" ");
            mon_info["id"] = i;
            mon_info["interface"] = result_temp[result_temp.length - 1];
            mon_info["config"] = result_temp[result_temp.length - 3];
            var tmp_res_x = result_temp[result_temp.length - 3].split("x")[0];
            var res_x = tmp_res_x.split("/")[0];
            var phy_len_x =  tmp_res_x.split("/")[1];
            var tmp_res_y = result_temp[result_temp.length - 3].split("x")[1];
            var res_y = tmp_res_y.split("/")[0];
            var phy_len_y =  tmp_res_y.split("/")[1];
            phy_len_y =  phy_len_y.split("+")[0];
            mon_info["res"] =  res_x + "*" + res_y;
            mon_info["len"] = phy_len_x + " mm width, " + phy_len_y + " mm height";
            mon_info["primary"] = result_temp[result_temp.length - 4].includes("*");
            monitor_array.push(mon_info);
        }
        // update logical structure
        monitors_Group = monitor_array;
        updateMonitorList(monitor_array);
        expandList();
        load_display_reslist();
        regNewMode();
    });
}

function load_display_reslist(){
    execute('xrandr', (output) => {
        spilt_result = output.split(/connected|disconnected/);
        var monitor_array = [];
        var counter = 0;
        spilt_result.forEach((element,index)=> {
            var profile_array = [];
            if (index % 2 && check_line_num(element) > 2){
                var element_arr = element.split("\n");
                var new_element = `
                <table>
                <tr>
                    <th>resoultion</th>
                    <th>refresh rate</th>
                <tr>
                `;
                element_arr.forEach( (innerElement, innerIndex) => {
                    if (innerIndex!=0 && innerIndex!=element_arr.length-1){
                        var reslv = innerElement.split("     ")[0];
                        var rate = innerElement.split("     ")[1];
                        rate = rate.replace(/\+/g, '(preferred)');
                        rate = rate.replace(/\*/g, '(current)');
                        new_element+= "<tr><td>" + reslv + "</td><td>" + rate + "</td></tr>";
                        // remove all spaces in reslv
                        reslv = reslv.replace(/\s/g, '');
                        
                        var againRate = rate.split("   ");
                        againRate.forEach((rateChild, rateIndex, rateArray) => {
                            rateArray[rateIndex] = rateArray[rateIndex].replace(/[\+\*\s]/g, '');
                        })
                        var temparray = [reslv, againRate];
                        profile_array.push(temparray);
                    }
                });
                new_element += "</table>";
                monitor_array.push(new_element);
                monitors_Group[counter]["profiles"] = [];
                monitors_Group[counter++]["profiles"] = profile_array;
            }
        });
        updateResList(monitor_array);
    });
}