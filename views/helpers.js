function renderPeriodcard(teacherlist,subject,start_time,end_time,session_type,room_number,note){
    return(
        `
        <div class="periodcard-container">
        <div class="lectureroom-container">
        <div>
        <%=  session_type =%> <%= room_number =%>
        </div>
        <hr>
        <div class="items">
        <%
  // Define your array

  // Function to get initials
  function getInitials(name) {
    // Split the name into words
    var words = name.split(" ");
    // Map over the words and get the first letter of each word, then uppercase it
    var initials = words.map(function(word) {
      return word.charAt(0).toUpperCase();
    });
    // Join the initials together
    return initials.join("");
  }

  // Iterate over the array and get initials for each name
  var initialsArray = teacherlist.map(getInitials);

  // Combine initials into a single string
  var combinedInitials = initialsArray.join(" ");
%>

<%= combinedInitials %>

        <div>
        </div>
        </div>
        `
    )
}

module.exports={
    renderPeriodcard
}