import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getDownloadURL, getStorage, list, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from "../firebase";
import { updateUserStart, updateUserFailure, updateUserSuccess, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserStart, signOutUserFailure, signOutUserSuccess } from '../redux/user/userSlice.js';
import { useDispatch } from 'react-redux';
import { Link } from "react-router-dom";
import Listing from '../../../api/models/listing.model.js';


const Profile = () => {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess,setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePercentage(Math.round(progress));
      },
      () => {
        setFileUploadError(true);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData((prev) => ({ ...prev, avatar: downloadURL }));
          console.log("File uploaded successfully:", downloadURL);
        } catch (err) {
          console.error("Error getting download URL:", err);
        }
      }
    );
  };

  const handleChange = (e)=>{

    setFormData({...formData, [e.target.id]: e.target.value});

  };

  const handleSubmit = async(e)=>{
    e.preventDefault();

    try {
      dispatch(updateUserStart());
      const dataToSend = {
        ...currentUser,
        ...formData,
      };
      console.log("Form data before update: ", dataToSend);
      
      const res = await fetch(`/api/user/update/${currentUser._id}`,{
        method:'POST',
        headers:{
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body:JSON.stringify(formData),
      });
      const data = await res.json();
      if(data.success===false){
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      
    }

  };

  const handleDeleteUser = async()=>{
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`,
        {
          method:'DELETE',
          credentials: 'include',
        }
      );
      const data = await res.json();
      if(data.success===false){
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      
    }

    

  };

  const handleSignOut =async()=>{
    try {
      dispatch(signOutUserStart());

      const res= await fetch(`/api/auth/signout`, {
        credentials: 'include',
      });

      const data = await res.json();

      if(data.success===false){
        dispatch(signOutUserFailure(data.message));
          return;
        }
        dispatch(signOutUserSuccess(data));

    } catch (error) {
      dispatch(signOutUserFailure(data.message));
      
    }

  }



  const handleShowListings = async () =>{
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();

      if(data.success===false){
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
      
    } catch (error) {
      setShowListingsError(true);

      
    }
  };

  const handleListingDelete= async(listingId) =>{
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`,{
        method: 'DELETE',
      });
      const data = await res.json();
      if(data.success === false){
        console.log(data.message);
        return;
      }
      setUserListings((prev)=> prev.filter((listing)=> listing._id !== listingId));
    } catch (error) {
      console.log(error.message);
      
      
    }
  }
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />

        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar || "https://via.placeholder.com/100?text=No+Image"}
          alt='profile'
          className='rounded-full size-24 object-cover cursor-pointer self-center mt-2'
        />

        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>
              Error Image Upload (Image must be less than 2MB)
            </span>
          ) : filePercentage > 0 && filePercentage < 100 ? (
            <span className='text-slate-700'>Uploading {filePercentage}%</span>
          ) : filePercentage === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          )}
        </p>

        <input
          type='text'
          placeholder='Username'
          defaultValue={currentUser.username}
          id='username'
          onChange={handleChange}
          className='border p-3 rounded-lg'
        />
        <input
          type='email'
          placeholder='Email'
          id='email'
          defaultValue={currentUser.email}
          onChange={handleChange}
          className='border p-3 rounded-lg'
        />
        <input
          type='password'
          placeholder='Password'
          id='password'
          onChange={handleChange}
          className='border p-3 rounded-lg'
        />

        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>
          
          {loading ? "loading..." : "update"}
        </button>


        <Link className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95' to={"/create-listing"}>
        Create Listing
        </Link>


      </form>

      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete Account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>


      <p className='text-red-700 mt-5'>{error ? error : ''}</p>

      <p className='text-green-700 mt-5'>
        { updateSuccess ? "User is updated successfully! " : ""}</p>

        <button onClick={handleShowListings} className='text-green-700 mt-5 w-full'>Show your Listings</button>
        
        <p className='text-red-700 mt-5'>{showListingsError ? 'Error showing listings': ''}</p>

        {userListings && 
          userListings.length>0 &&
          <div className="flex flex-col gap-4">
            <h1 className='text-center mt-7 text-2xl font-semibold '>Your listings</h1>
          {userListings.map((listing)=>(
          <div key={listing._id} className="border rounded-lg p-3 flex justify-between items-center gap-4">
            <Link to ={`/listing/${listing._id}`} > 
            <img 
            src={listing.imageUrls[0]}
            alt="Listing Image"
            className='size-16 object-contain '
            />
            </Link>
            <Link className='text-slate-700 font-semibold  hover:underline truncate flex-1' to={`/listing/${listing._id}`}
            >
            <p >{listing.name}</p>
            </Link>

            <div className="flex flex-col items-center ">

              <button onClick={()=>handleListingDelete(listing._id)} className='text-red-700 uppercase'>Delete</button>

              <Link to={`/update-listing/${listing._id}`}>
            <button className='text-green-700 uppercase'>Edit</button>
              </Link>
            </div>
        


          </div>

        ))}
        </div>}
         

    </div>
  );
};

export default Profile;
