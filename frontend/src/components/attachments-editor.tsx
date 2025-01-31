import React from "react";
import axios from "axios";

const AttachmentsEditor = () => {
  const [imageUploaded, setImageUploaded] = React.useState(false);
  const [file, setFile] = React.useState<File>();

  const uploadFile = async (file: File) => {
    const res = await axios.post(
      `http://127.0.0.1:5000/notes/upload_image/`,
      { file },
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    console.log(res);

    const resData = JSON.parse(res.data);
    console.log(resData);
    // Do something with the uploaded image URL
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(file);
      setFile(file);
      setImageUploaded(true);
    }
  };

  const handleUploadButtonClick = () => {
    if (file) {
      uploadFile(file as File);
    }
  };

  const handleCancelClick = () => {
    setImageUploaded(false);
  };

  return (
    <div>
      <div>
        <div className='max-w-sm mx-auto rounded-lg overflow-hidden md:max-w-sm'>
          <div className='md:flex'>
            <div className='w-full p-3'>
              <div className='relative h-48 rounded-lg border-2 border-blue-500 bg-gray-50 flex justify-center items-center shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out'>
                {imageUploaded ? (
                  <>
                    <img
                      alt='Uploaded File'
                      className='h-full w-full object-cover'
                      src={URL.createObjectURL(file as Blob)}
                    />
                    <button
                      className='absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded'
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className='absolute flex flex-col items-center'>
                    <img
                      alt='File Icon'
                      className='mb-3'
                      src='https://img.icons8.com/dusk/64/000000/file.png'
                    />
                    <span className='block text-gray-500 font-semibold'>
                      Drag &amp; drop your files here
                    </span>
                    <span className='block text-gray-400 font-normal mt-1'>
                      or click to upload
                    </span>
                  </div>
                )}

                <input
                  name='file'
                  className='h-full w-full opacity-0 cursor-pointer'
                  type='file'
                  onChange={handleFileUpload}
                />
              </div>
              {imageUploaded && (
                <button
                  className='mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                  onClick={handleUploadButtonClick}
                >
                  Upload
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachmentsEditor;
