import React from "react";
// import axios from "axios";

const AttachmentsEditor = () => {
  const [imageUploaded, setImageUploaded] = React.useState(false);
  const [file, setFile] = React.useState<File>();
  const [showDialog, setShowDialog] = React.useState(false);
  const [textInput, setTextInput] = React.useState("");

  // const uploadFile = async (file: File) => {
  //   const res = await axios.post(
  //     `http://127.0.0.1:5000/notes/generate_cover_image/`,
  //     {
  //       text: "Hello, World!",
  //     },
  //     {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //       },
  //     }
  //   );
  //   console.log(res);

  //   const resData = JSON.parse(res.data);
  //   console.log(resData);
  //   // Do something with the uploaded image URL
  // };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(file);
      setFile(file);
      setImageUploaded(true);
    }
  };

  // const handleUploadButtonClick = () => {
  //   if (file) {
  //     uploadFile(file as File);
  //   }
  // };

  const handleCancelClick = () => {
    setImageUploaded(false);
  };

  const handleGenerateImageClick = () => {
    setShowDialog(true);
  };

  const handleDialogSubmit = () => {
    // Call your function here with the text input value
    console.log(textInput);
    setShowDialog(false);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/generateImage/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ text: "Hello, World!" }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  };

  const handleDialogCancel = () => {
    setShowDialog(false);
  };

  const genImage = () => {};

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
                <>
                  <button
                    className='mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                    onClick={handleGenerateImageClick}
                  >
                    Generate Image from AI
                  </button>
                  <button
                    className='mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                    onClick={genImage}
                  >
                    Upload
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {showDialog && (
        <div className='fixed inset-0 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6'>
            <h2 className='text-lg font-semibold mb-4'>Enter Text</h2>
            <textarea
              className='w-full h-32 border border-gray-300 rounded-lg p-2 mb-4'
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            ></textarea>
            <div className='flex justify-end'>
              <button
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2'
                onClick={handleDialogSubmit}
              >
                Submit
              </button>
              <button
                className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
                onClick={handleDialogCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentsEditor;
