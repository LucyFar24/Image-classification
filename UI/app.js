Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false 
    });

    dz.on("addedfile", function() {
        if (dz.files[1]!=null) {
            dz.removeFile(dz.files[0]);
        }
    });

    dz.on("complete", function(file) {
        let imageData = file.dataURL;

        var url = "http://127.0.0.1:5000/classify_image";

        $.post(url, {
            image_data: file.dataURL
        },function(data, status) {
             /*
             data = [
               {
                   'class': 'Leo_messi', 
                   'class_probability': [78.76, 20.54, 0.43, 0.26], 
                   'class_dictionary': {
                    'Leo_messi': 0, 
                    'Neymar': 1, 
                    'Roger_Federer': 2, 
                    'Ronaldo': 3
                    }
                },
             ]
             */

            console.log(data);
            if (!data || data.length==0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();
                $("#error").show();
                return;
            }
            let players = ["Lionel_Messi", "Neymar_Jr", "Cristiano_Ronaldo"];

            let match = null;
            let bestScore = -1;
            for (let i=0;i<data.length;++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if(maxScoreForThisClass>bestScore) {
                    match = data[i]
                    bestScore = maxScoreForThisClass;
                }
            }
            if (match) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();
                $("#resultHolder").html($(`[data-player="${match.class}"`).html());
                let classDictionary = match.class_dictionary;
                for(let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let probabilityScore = match.class_probability[index];
                    let elementName = "#score_" + personName;
                    $(elementName).html(probabilityScore);
                }
            }
            // dz.removeFile(file);
        });
    });
    
    $("#submitBtn").on('click', function (e) {
        dz.processQueue();
    });
}

$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();
    
    init();
});