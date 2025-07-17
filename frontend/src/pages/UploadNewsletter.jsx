import { useNavigate } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import UploadList from '../components/UploadList';

const UploadNewsletter = () => {
  return (
    <div className="upload-newsletter">
      <div className="max-w-xl mx-auto">
        <UploadForm editMode={false} />
      </div>
      <div className="max-w-4xl mx-auto mt-8">
        <UploadList />
      </div>
    </div>
  );
};

export default UploadNewsletter;
