import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Main.css';

const Main = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formType, setFormType] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({});
  const [getAll, setGetAll] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    mobile: '',
    password: '',
  });

  const [getemail, setGetEmail] = useState("")

  const openModal = (type, userId = null) => {
    setFormType(type);
    if (type === 'update' && userId) {
      const selectedUser = users.find((user) => user.userId === userId);
      setFormData({
        email: selectedUser.email,
        name: selectedUser.name,
        mobile: selectedUser.mobile,
        password: selectedUser.password,
      });
      setImage(selectedUser.profilePicture || null);
      setImagePreview(selectedUser.profilePicture || null);
      setSelectedIds((prevIds) => {
        if (prevIds.includes(userId)) {
          return prevIds.filter((id) => id !== userId);
        } else {
          return [...prevIds, userId];
        }
      });
    } else if(type === 'create'){
      setErrors({});
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormType('');
    setImage(null);
    setImagePreview(null);
    setFormData({
      email: '',
      name: '',
      mobile: '',
      password: '',
    });
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const base64 = await convertImageToBase64(file);
      setImage(base64);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name && formType !== "getUserById") {
      newErrors.name = "Name is required.";
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required.";
    }
    if (!formData.mobile && formType !== "getUserById") {
      newErrors.mobile = "Mobile number is required.";
    } else if (formData.mobile.length !== 10) {
      newErrors.mobile = "Mobile number must be exactly 10 digits.";
    }
    if (!formData.password && formType !== "getUserById") {
      newErrors.password = "Password is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckboxChange = (userId) => {
    setSelectedIds([]);
    setSelectedIds((prevIds) => {
      if (prevIds.includes(userId)) {
        return prevIds.filter((id) => id !== userId);
      } else {
        return [...prevIds, userId];
      }
    });
  };

  const getAllUsers = async () => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await axios.get('https://user-crud-backend-0ys2.onrender.com/user/getAllUsers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowTable(true);
      setGetAll(true);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const deleteUsers = async () => {
    const token = localStorage.getItem('jwtToken');
    try {
      if (selectedIds.length === 0) {
        console.log('No users selected for deletion.');
        return;
      }

      const LoggedUser = localStorage.getItem("LoggedInUser");
      console.log(LoggedUser)
      console.log(!selectedIds.includes(LoggedUser));
      if(!selectedIds.includes(LoggedUser)){
        const response = await axios.delete(
          'https://user-crud-backend-0ys2.onrender.com/user/delete', {
          headers: {
            'Content-Type': `application/json`,
            Authorization: `Bearer ${token}`,
          },
          data: { userIds: selectedIds }
        }
        );

        setUsers((prevUsers) =>
          prevUsers.filter((user) => !selectedIds.includes(user.userId))
        );
        setSelectedIds([]);
        Swal.fire('Delete Successful', response.data.message, 'success');
        console.log('Users deleted:', selectedIds);
      } else {
        Swal.fire("Something Went Wrong!", "Cannot delete the LoggedIn User", "error");
        return;
      }
    } catch (error) {
      console.error('Error deleting users:', error);
      Swal.fire('Delete Unsuccessful', error.message, 'error');
    }
  };


  const updateUserById = async (userId, updatedUser) => {
    const token = localStorage.getItem('jwtToken');
    try {
      const LoggedUser = localStorage.getItem("LoggedInUser");
      if(userId != LoggedUser){
        const response = await axios.put(
          `https://user-crud-backend-0ys2.onrender.com/user/update/${userId}`,
          updatedUser,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('User updated:', response.data);

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === userId ? { ...user, ...updatedUser } : user
          )
        );
  
        closeModal();
        console.log(response.data.message);
        Swal.fire("Update Successful", response.data.message, "success");
        getAllUsers();
        setSelectedIds([]);
      } else {
        Swal.fire("Something Went Wrong!", "Cannot Update the LoggedIn User", "error");
        return;
      }
    } catch (error) {
      console.error('Error updating user:', error.response?.data || error.message);
      Swal.fire('Update Unsuccessful', error.message, "error");
    }
  };

  const getUserByEmail = async (email) => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await axios.get(`https://user-crud-backend-0ys2.onrender.com/user/getUser/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowTable(true);
      setGetAll(false);
      setModalOpen(false);
      setUser(response.data.data);
    } catch (error) {
      console.error('Error fetching user by email:', error);
    }
  };

  const createUser = async (newUser) => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await axios.post('https://user-crud-backend-0ys2.onrender.com/user/create', newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prevUsers) => [...prevUsers, response.data]);
      console.log('User created:', response.data);
      closeModal();
      Swal.fire("Creation Successful", response.data.message, "success");
      getAllUsers();
    } catch (error) {
      Swal.fire("Creation Unsuccessful", error.message, "error");
      console.error('Error creating user:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(validateForm()){
      const { email, name, mobile, password } = formData;
      const newUser = {
        email,
        name,
        mobile,
        password,
        profilePicture: image || null,
        metadata: "",
      };

      if (formType === 'create') {
        createUser(newUser);
      } else if (formType === 'getUserById') {
        console.log("Inside");
        getUserByEmail(email);
      } else if (formType === 'update') {
        const userId = selectedIds[0];
        updateUserById(userId, newUser);
      }
  }
  };

  const handleEmailChange = (e) => {
    setGetEmail(e.target.value);
  }

  const handleGetByEmail = (e) => {
    e.preventDefault();
    console.log("working");
    getUserByEmail(getemail);
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold text-center mb-8">User Management</h1>

      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={getAllUsers}
        >
          Get All Users
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          onClick={() => openModal('getUserById')}
        >
          Get User By Email
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Select</th>
              <th className="border border-gray-300 px-4 py-2">User ID</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Mobile</th>
              <th className="border border-gray-300 px-4 py-2">Profile Picture</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {showTable && getAll && users.length > 0 && users.map((user) => (
              <tr key={user.userId}>
                <td className="border border-gray-300 px-4 py-2">
                  <input
                    type="checkbox"
                    onChange={() => handleCheckboxChange(user.userId)}
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">{user.userId}</td>
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                <td className="border border-gray-300 px-4 py-2">{user.mobile}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <img
                    src={user.profilePicture || 'https://via.placeholder.com/50'}
                    alt="Profile"
                    className="w-12 h-12 object-cover rounded-full mx-auto"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                    onClick={() => openModal('update', user.userId)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
            {showTable && !getAll && <tr key={user.userId}>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(user.userId)}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">{user.userId}</td>
              <td className="border border-gray-300 px-4 py-2">{user.name}</td>
              <td className="border border-gray-300 px-4 py-2">{user.email}</td>
              <td className="border border-gray-300 px-4 py-2">{user.mobile}</td>
              <td className="border border-gray-300 px-4 py-2">
                <img
                  src={user.profilePicture || 'https://via.placeholder.com/50'}
                  alt="Profile"
                  className="w-12 h-12 object-cover rounded-full mx-auto"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                  onClick={() => openModal('update', user.userId)}
                >
                  Update
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => console.log('Delete user', user.userId)}
                >
                  Delete
                </button>
              </td>
            </tr>}
            {!showTable && (
              <tr>
                <td colSpan="7" className="text-center py-4">No Records Found!</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end mt-4 space-x-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => openModal('create')}
          >
            Create User
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={deleteUsers}
          >
            Delete Selected
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {formType === 'getUserById' ? 'Get User By Email' : `${formType} User`}
            </h2>
            <form className="space-y-4" onSubmit={formType === "getUserById" ? handleGetByEmail : handleSubmit}>
              {formType === "getUserById" ? (
                <div>
                  <label
                    className="block text-gray-600 font-medium mb-1"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={getemail}
                    onChange={handleEmailChange}
                    className={`w-full px-4 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"
                      } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label
                      className="block text-gray-600 font-medium mb-1"
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"
                        } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-gray-600 font-medium mb-1"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"
                        } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-gray-600 font-medium mb-1"
                      htmlFor="mobile"
                    >
                      Mobile
                    </label>
                    <input
                      id="mobile"
                      type="text"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      maxLength="10"
                      className={`w-full px-4 py-2 border ${errors.mobile ? "border-red-500" : "border-gray-300"
                        } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter mobile"
                    />
                    {errors.mobile && (
                      <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-gray-600 font-medium mb-1"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"
                        } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter password"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-gray-600 font-medium mb-1"
                      htmlFor="profilePicture"
                    >
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover mt-4 rounded"
                      />
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-between space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={false}
                  className="w-full py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Main;