import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled, { keyframes } from 'styled-components';
import FileViewer from 'react-file-viewer';
import mammoth from 'mammoth'; // For .doc file support

// Animations and Styled Components (same as before)
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const grow = keyframes`
  from { width: 0; }
  to { width: ${props => props.width || '100%'}; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f4f4f9;
  height: 100vh;
  color: #333;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2f4f4f;
  padding: 15px;
  color: white;
  border-radius: 8px;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: white;
`;

const UploadArea = styled.div`
  margin: 20px 0;
  background: #fff;
  border: 2px dashed #ccc;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  &:hover {
    background: #e9f5f5;
  }
`;

const ProgressBar = styled.div`
  background-color: #ccc;
  border-radius: 10px;
  margin: 20px 0;
  height: 30px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #4caf50;
  animation: ${grow} 2s ease-in-out forwards;
`;

const PlagiarismResult = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  animation: ${fadeIn} 1s ease-in-out;
`;

const StatBox = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 1.2rem;
  color: #333;
`;

const SourceList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const SourceItem = styled.li`
  padding: 10px;
  background: #f9f9f9;
  margin-bottom: 10px;
  border-left: 4px solid #ff4c4c;
  font-size: 1.1rem;
  transition: background 0.2s ease-in-out;
  &:hover {
    background: #f1f1f1;
  }
`;

const DocumentViewer = styled.div`
  margin-top: 20px;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingSpinner = styled.div`
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

const UploadPercentage = styled.div`
  margin-top: 15px;
  font-size: 1.5rem;
  color: #333;
`;

const ContentContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: calc(100vh - 120px);
  margin-top: 20px;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

const LeftSide = styled.div`
  flex: 1;
  padding: 10px;
  height: 100%;
  overflow-y: auto;

  @media (max-width: 768px) {
    height: auto;
  }
`;

const RightSide = styled.div`
  flex: 1;
  padding: 10px;
  height: 100%;
  border-left: 2px solid #eee;
  overflow-y: auto;

  @media (max-width: 768px) {
    border-left: none;
    height: auto;
  }
`;

const RescanButton = styled.button`
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }
`;

const MainApp = () => {
  const [uploaded, setUploaded] = useState(false);
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null); // For .doc and .txt files
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      handleFilePreview(acceptedFiles[0]); // Handle file preview
      simulateUploadAndScan(acceptedFiles[0]);
    }
  });

  const handleFilePreview = (file) => {
    const reader = new FileReader();

    if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Handle .doc or .docx files
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        setFileContent(result.value); // Set the extracted text as file content
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type === 'text/plain') {
      // Handle .txt files
      reader.onload = (e) => {
        setFileContent(e.target.result); // Set the text content
      };
      reader.readAsText(file);
    } else {
      // For other file types (e.g., PDF), set file content to null
      setFileContent(null);
    }
  };

  const simulateUploadAndScan = async (file) => {
    setIsLoading(true);
    setIsScanning(true);

    // Simulate upload progress
    for (let i = 10; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setProgress(i);
    }

    // Call the plagiarism-checking API after the file is "uploaded"
    const scanResponse = await scanFile(file);
    if (scanResponse.data) {
      setScanResult(scanResponse.data);
    } else {
      console.error('Error:', scanResponse.error);
      setScanResult(null);
    }
    setUploaded(true);
    setIsLoading(false);
    setIsScanning(false);
  };

  const scanFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error with the API request');
      }

      const data = await response.json();
      console.log('API Response:', data); // Log the full API response
      return { data: data.plagiarismResults }; // Access the plagiarismResults property
    } catch (error) {
      console.error('Error:', error);
      return { data: [] };
    }
  };

  const handleRescan = () => {
    setUploaded(false);
    setFile(null);
    setFileContent(null);
    setScanResult(null);
    setProgress(0);
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>Plagiarism Dashboard</Title>
      </Header>

      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <UploadPercentage>{progress}% Uploaded</UploadPercentage>
        </LoadingOverlay>
      )}

      <ContentContainer>
        <LeftSide>
          {!uploaded ? (
            <UploadArea {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag & drop a file here, or click to select a file</p>
            </UploadArea>
          ) : (
            <>
              <ProgressBar>
                <ProgressFill width={`${progress}%`} />
              </ProgressBar>

              {scanResult && (
                <PlagiarismResult>
                  <StatBox>
                    <span>Plagiarism Detected:</span>
                    <span>{scanResult.length > 0 ? 'Yes' : 'No'}</span>
                  </StatBox>
                  <StatBox>
                    <span>Sources Found:</span>
                    <span>{scanResult.length}</span>
                  </StatBox>
                  <SourceList>
                    {scanResult.map((source, index) => (
                      <SourceItem key={index}>
                        {source.fileName} - <span>{source.percentage}</span>
                      </SourceItem>
                    ))}
                  </SourceList>
                  <RescanButton onClick={handleRescan}>Rescan Another File</RescanButton>
                </PlagiarismResult>
              )}
            </>
          )}
        </LeftSide>

        <RightSide>
          {uploaded && file && (
            <DocumentViewer>
              {file.type === 'application/pdf' ? (
                <FileViewer
                  fileType="pdf"
                  filePath={URL.createObjectURL(file)}
                  onError={(e) => console.error('Error loading file:', e)}
                />
              ) : file.type === 'text/plain' ? (
                <pre>{fileContent}</pre> // Render .txt file content
              ) : file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
                <div dangerouslySetInnerHTML={{ __html: fileContent }} /> // Render .doc file content as HTML
              ) : (
                <p>Unsupported file type</p>
              )}
            </DocumentViewer>
          )}
        </RightSide>
      </ContentContainer>
    </DashboardContainer>
  );
};

export default MainApp;