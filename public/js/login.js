$(".pwd").on("input", function (event) {

   this.type = "text";

   setTimeout(()=>{
       this.type = "password";
   },400);

});

