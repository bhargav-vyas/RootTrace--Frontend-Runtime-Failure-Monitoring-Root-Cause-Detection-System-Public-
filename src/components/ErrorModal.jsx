const [selectedError, setSelectedError] = useState(null);
const [aiResponse, setAiResponse] = useState("");
const [loading, setLoading] = useState(false);
const analyzeError = async () => {
  setLoading(true);

  const response = await axios.post("http://localhost:8081/api/ai/analyze", {
    stackTrace: selectedError.stackTrace,
  });

  setAiResponse(response.data);

  setLoading(false);
};