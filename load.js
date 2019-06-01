let $ = require('jquery')
let fs = require('fs')
let filename = 'contacts'
let sno = 0

$('#reload-bt').on('click', () => {
    updateMonitorList()
})

// function addEntry(name, email) {
//    if(name && email) {
//       sno++
//       let updateString = '<tr><td>'+ sno + '</td><td>'+ name +'</td><td>' 
//          + email +'</td></tr>'
//       $('#contact-table').append(updateString)
//    }
// }

function updateMonitorList() {  
    let updateString = `<li class="collection-item avatar">
    <img src="images/icons8-linux-server-80.png" alt="" class="mon-icon responsive-img"> 
    <span class="title">eDP1</span> 
    <p>1920x1080 60hz 
    <br>  
    <div class="chip chipcolor"> 
        Primary 
    </div> 
    </p> 
    <a class="waves-effect waves-light blue btn-small secondary-content collapsible">
    <font color="white">Modes</font>
    </a>
    <div class="content">
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    </div>
    </li>`;
    $('#monitor-group').append(updateString)
}

function expandList() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
        content.style.maxHeight = null;
        } else {
        content.style.maxHeight = content.scrollHeight + "px";
        } 
    });
    }
}

updateMonitorList()
expandList()
