/*import React, { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import "./Detail.css"

function Detail(){

  const[values, setValues] =useState({
    firstname: '',
    lastname: '',
    email: '',
    gender: '',
    Course: '',
    collegeName: '',
    UserID: '',

  })

  const handleChanges = (e) => {
    setValues({...values,[e.target.name]:[e.target.value]})
  }

  const handleSubmit=(e) => {
    e.preventDefault()
    console.log(values)
  }
  
  const ResetFun = () => {
    setValues({firstname:'', lastname: '', email: '', gender: '', Course: '', collegeName: '', UserID:''})
  }

  return(

    <div className="container">
      <h1>STUDENT DETAIL</h1>
      <form onSubmit={handleSubmit}>

        <label htmlFor="firstname">First Name*</label>
        <input type="text" placeholder="Enter First Name" name="firstname" 
        onChange={(e) => handleChanges(e)} required value={values.firstname}/>

        <label htmlFor="lastname">Last Name*</label>
        <input type="text" placeholder="Enter Last Name" name="lastname" 
        onChange={(e) => handleChanges(e)} required value={values.lastname}/>

        <label htmlFor="email">Email*</label>
        <input type="email" placeholder="Enter the Email" name="email" 
        onChange={(e) => handleChanges(e)} required value={values.email}/>

        <label htmlFor="CollegeName">College Name*</label>
        <input type="text" placeholder="Enter the College Name" name="CollegeName" 
        onChange={(e) => handleChanges(e)} required value={values.collegeName}/>

        <label htmlFor="Course">Course*</label>
        <input type="text" placeholder="Enter the Course" name="Course" 
        onChange={(e) => handleChanges(e)} required value={values.Course}/>

        <label htmlFor="UserID">UserID*</label>
        <input type="text" placeholder="Enter your UserID" name="UserID" 
        onChange={(e) => handleChanges(e)} required value={values.UserID}/>

        <label htmlFor="gender">Gender</label>
        <input type="radio" name="gender"
        onChange={(e) => handleChanges(e)}/> Male
        <input type="radio" name="gender"
        onChange={(e) => handleChanges(e)}/> Female
        <input type="radio" name="gender"
        onChange={(e) => handleChanges(e)}/> Other

        <button type="button" onClick={ResetFun}>Reset</button>
        <button type="submit">Submit</button>

      </form>
    </div>
  );

}

export default Detail;*/


import React, { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import "./Detail.css";

function Detail() {
  const [values, setValues] = useState({
    firstname: '',
    lastname: '',
    email: '',
    gender: '',
    course: '',
    collegeName: '',
    userID: '',
  });

  // Handles input changes and updates state
  const handleChanges = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  // Handles form submission and stores data in Firebase Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "students", values.userID), {
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        gender: values.gender,
        course: values.course,
        collegeName: values.collegeName,
        userID: values.userID,
      });
      alert("Form submitted successfully!");
      ResetFun();
    } catch (error) {
      console.error("Error writing document: ", error);
      alert("Submission failed. Check console for errors.");
    }
  };

  // Resets all form values
  const ResetFun = () => {
    setValues({
      firstname: '',
      lastname: '',
      email: '',
      gender: '',
      course: '',
      collegeName: '',
      userID: '',
    });
  };

  return (
    <div className="container">
      <h1>STUDENT DETAIL</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="firstname">First Name*</label>
        <input
          type="text"
          placeholder="Enter First Name"
          name="firstname"
          onChange={handleChanges}
          required
          value={values.firstname}
        />

        <label htmlFor="lastname">Last Name*</label>
        <input
          type="text"
          placeholder="Enter Last Name"
          name="lastname"
          onChange={handleChanges}
          required
          value={values.lastname}
        />

        <label htmlFor="email">Email*</label>
        <input
          type="email"
          placeholder="Enter the Email"
          name="email"
          onChange={handleChanges}
          required
          value={values.email}
        />

        <label htmlFor="collegeName">College Name*</label>
        <input
          type="text"
          placeholder="Enter the College Name"
          name="collegeName"
          onChange={handleChanges}
          required
          value={values.collegeName}
        />

        <label htmlFor="course">Course*</label>
        <input
          type="text"
          placeholder="Enter the Course"
          name="course"
          onChange={handleChanges}
          required
          value={values.course}
        />

        <label htmlFor="userID">User ID*</label>
        <input
          type="text"
          placeholder="Enter your User ID"
          name="userID"
          onChange={handleChanges}
          required
          value={values.userID}
        />

        <label>Gender*</label>
        <div className="gender-options">
          <label>
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={values.gender === "Male"}
              onChange={handleChanges}
              required
            />{" "}
            Male
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={values.gender === "Female"}
              onChange={handleChanges}
            />{" "}
            Female
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Other"
              checked={values.gender === "Other"}
              onChange={handleChanges}
            />{" "}
            Other
          </label>
        </div>

        <button type="button" onClick={ResetFun}>
          Reset
        </button>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Detail;
