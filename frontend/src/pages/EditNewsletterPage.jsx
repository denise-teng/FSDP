import { useParams, useLocation } from "react-router-dom";
import UploadForm from "../components/UploadForm";

const EditNewsletterPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const isDraft = location.pathname.includes('/edit-draft/');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        {isDraft ? "Edit Draft" : "Edit Newsletter"}
      </h1>
      <UploadForm 
        editMode={true} 
        newsletterId={id} 
        isDraft={isDraft}  // Make sure to pass this prop
      />
    </div>
  );
};

export default EditNewsletterPage;