import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AnalyzeMeetingsComponent = () => {
  const [inputContacts, setInputContacts] = useState('');
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [recommendedTimes, setRecommendedTimes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const parseContacts = () => {
    return inputContacts
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/flagged-messages');
        setFlaggedMessages(response.data.flaggedMessages || []);
        setRecommendedTimes(response.data.recommendedTimes || {});
        setLastUpdated(new Date());
      } catch (err) {
        setError('Failed to load existing messages');
      }
    };
    loadInitialData();
  }, []);

  const handleAnalyzeMessages = async () => {
    setLoading(true);
    setError(null);
    const contacts = parseContacts();

    if (contacts.length === 0) {
      setError('Please enter at least one contact');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/scrape-whatsapp', {
        contacts: contacts
      });

      setFlaggedMessages(response.data.flaggedMessages || []);
      setRecommendedTimes(response.data.recommendedTimes || {});
      setLastUpdated(new Date());

      const updatedResponse = await axios.get('http://localhost:5000/api/flagged-messages');
      setFlaggedMessages(updatedResponse.data.flaggedMessages || []);
      setRecommendedTimes(updatedResponse.data.recommendedTimes || {});
      setLastUpdated(new Date());

    } catch (err) {
      const errMsg = err?.response?.data?.error || err.message || 'Analysis failed';
      const isJsonError = errMsg.includes("Unexpected token");
      const userFriendlyError = isJsonError ? "Invalid contact name" : errMsg;
      setError(userFriendlyError);
      toast.error(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete('http://localhost:5000/api/flagged-messages', {
        data: { messageId }
      });
      setFlaggedMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success("Message deleted");
    } catch (err) {
      setError('Failed to delete message');
      toast.error("Failed to delete message");
    }
  };

  const parsedContacts = parseContacts();

  const filteredMessages = parsedContacts.length === 0
    ? flaggedMessages
    : flaggedMessages.filter(msg => parsedContacts.includes(msg.contact));

  const groupMessagesByContact = (messages) => {
    return messages.reduce((acc, msg) => {
      const key = msg.contact ?? "Unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(msg);
      return acc;
    }, {});
  };

  return (
    <div className="flex justify-center p-6 bg-gray-100 min-h-screen">
      <div className="w-full max-w-3xl bg-white text-gray-900 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-600">Potential Opportunities</h2>
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex items-center space-x-2">
            <label htmlFor="contacts" className="text-sm font-medium text-gray-700">
              Contacts to scan:
            </label>
            <input
              id="contacts"
              type="text"
              value={inputContacts}
              onChange={(e) => setInputContacts(e.target.value)}
              className="bg-gray-100 border border-gray-300 text-gray-800 px-3 py-2 rounded text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter exact contact name"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAnalyzeMessages}
              disabled={loading}
              className={`px-5 py-2 rounded-full font-semibold text-white transition flex items-center justify-center text-sm ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Analyze Messages'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}

        {filteredMessages.length > 0 ? (
          <ul className="space-y-6">
            {Object.entries(groupMessagesByContact(filteredMessages)).map(([contact, messages]) => (
              <li key={contact} className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">{contact}</h3>
                {recommendedTimes[contact] && (
                  <p className="text-sm text-green-600 mb-2">
                    🕒 Recommended meeting time: <strong>{recommendedTimes[contact]}</strong>
                  </p>
                )}

                <ul className="space-y-3">
                  {messages.map((message) => (
                    <li
                      key={message.id ?? `${contact}-${message.timestamp}-${message.text.slice(0, 10)}`}
                      className="bg-white border border-gray-200 rounded-md p-3"
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-gray-800 whitespace-pre-wrap">{message.text}</p>
                        <div className="flex space-x-2">
                          
                          <button
                            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.meta
                          ? message.meta.match(/\[(.*?)\]/)?.[1] || 'Unknown Time'
                          : new Date(message.timestamp).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 italic">No meeting requests found.</p>
            <p className="text-sm text-gray-500 mt-2">
              Enter contacts and click "Analyze Messages" to scan for meeting requests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzeMeetingsComponent;
