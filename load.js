let $ = require('jquery')
const exec = require('child_process').exec;

let monitors_Group = [];
let selected_monitor_id = null; // null indicate not selected



$(document).ready(function(){
    $('#reload-bt').click();
})

$('#new_mode_bt').on('click', () => {
    var x_param = $("#x-len").val();
    var y_param = $("#y-len").val();
    var rate_param = $("#rate").val();
    var monitor_param = monitors_Group[selected_monitor_id]["interface"];

    process_newMode(monitor_param, x_param, y_param, rate_param);
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

// reset selected id to null
var onModalClose = function() {
    selected_monitor_id = null;
};


function newMode_handler(evt) {
    var elem= document.querySelector('.modal');
    var instance = M.Modal.init(elem, { onCloseEnd: onModalClose });
    instance.open();
    selected_monitor_id = monitors_Group[evt.currentTarget.i]["id"];
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
        callback(stdout, error, stderr); 
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
        var active_interface_list = [];
        for(var i = 0;i < monitors_Group.length; ++i){
            active_interface_list.push(monitors_Group[i]["interface"]);
        }
        load_display_reslist(total_monitors, active_interface_list);
        regNewMode();
    });
}


function active_monitor_checker(content, active_interface_list){
    console.log(content);
    console.log(active_interface_list);
    for (let index = 0; index < active_interface_list.length; index++) {
        if (content.includes(active_interface_list[index])){
            return true;
        }
    }
    return false;
}

function load_display_reslist(total_monitors, active_interface_list){
    execute('xrandr', (output) => {
        spilt_result = output.split(/connected|disconnected/);
        var monitor_array = [];
        var counter = 0;
        var flag = false;
        spilt_result.forEach((element,index)=> {
            var profile_array = [];
            if (index % 2 && check_line_num(element) > 2 && flag){
                var element_arr = element.split("\n");
                var new_element = `
                <table>
                <tr>
                    <th>resoultion profile</th>
                    <th>refresh rate</th>
                <tr>
                `;
                element_arr.forEach( (innerElement, innerIndex) => {
                    if (innerIndex!=0 && innerIndex!=element_arr.length-1){
                        var reslv = innerElement.split(/ {2,}/)[1];
                        var rate = innerElement.split(/ {2,}/);
                        new_element+= "<tr><td>" + reslv + "</td><td>";
                        var rate_html = "";
                        for (var i = 2; i< rate.length; ++i){
                            if (rate[i]!= ""){
                                var curr = "";
                                var pre = "";
                                if (rate[i].match(/\*/g)){
                                    curr = "current_rate";
                                }
                                if (rate[i].match(/\+/g)){
                                    pre = "preferred_rate";
                                }
                                if (pre != "" && curr != ""){
                                    pre = "ideal_rate";
                                }
                                rate[i] = rate[i].replace(/\+/g, '(preferred)');
                                rate[i] = rate[i].replace(/\*/g, '(current)');
                                rate_html += "<span class='rate_rounded " + curr + " "+ pre +" '>" + rate[i] + "</span> ";
                            }
                        }
                        
                        new_element += rate_html + "</td></tr>";
                        // remove all spaces in reslv
                        reslv = reslv.replace(/\s/g, '');
                        
                        var againRate = [];
                        for (var i = 2; i<rate.length; ++i){
                            if (rate[i]!= ""){
                                againRate.push(rate[i].replace(/[\+\*\s]/g, ''));
                            }
                        }
                        var temparray = [reslv, againRate];
                        profile_array.push(temparray);
                    }
                });
                console.log("profile_array=>" + profile_array);
                new_element += "</table>";
                monitor_array.push(new_element);
                monitors_Group[counter]["profiles"] = [];
                monitors_Group[counter++]["profiles"] = profile_array;
                flag = false;
            }else{
                if (active_monitor_checker(element, active_interface_list))
                    flag = true;
            }
        });
        updateResList(monitor_array);
    });
}

function new_mode(monitor, modeline) {
    execute("xrandr --newmode " + modeline, (output, stderr) => {
        console.log("[new_mode][stdout] =>" + output);
        console.log("[new_mode][stderr] => " + stderr);
        if (stderr != null) {
            var err_message = stderr.toString();
            if (err_message.includes("X Error of failed request:  BadName (named color or font does not exist")){
                // possibly modeline already exist
                M.toast({html: '<i class="material-icons small green rounded" >check</i>&nbsp;&nbsp;Newmode: modeline already existed', classes: 'rounded'});
            }else
                alert(stderr);
        }
    });

    // trim modeline profile name
    modeline = modeline.split(" ")[1];
    add_mode(monitor, modeline);
}

function add_mode(monitor, modeline){
    var addmode = "xrandr --addmode " + monitor + " " + modeline;
    console.log("addmode cmd => " + addmode);
    execute(addmode, (output, stderr) => {
        console.log("[add_mode][stdout] =>" + output);
        console.log("[add_mode][stderr] => " + stderr);
        if (output == "" && stderr == null){
            M.toast({html: '<i class="material-icons small green rounded" >check</i>&nbsp;&nbsp;New mode added successfully', classes: 'rounded'});
            $('#reload-bt').click();
        }
    });
}


function process_newMode(monitor, x, y, rate){
    var cvt_check = "cvt " + x + " " + y;
    execute(cvt_check, (modeline, stderr) => {
        modeline = modeline.split("Modeline")[1];
        console.log("modeline:" + modeline);
        new_mode(monitor, modeline);
    });
}