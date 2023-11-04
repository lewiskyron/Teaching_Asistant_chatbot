from flask import Flask, jsonify, request, make_response
import os
import logging
import sys
from dotenv import load_dotenv
from llama_index import GPTVectorStoreIndex, NotionPageReader
from flask_cors import CORS
from llama_index.response.schema import Response

# Initialize the Flask app
logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))

load_dotenv()
openai_api_key = os.environ.get("OPENAI_API_KEY")
integration_token = os.environ.get("INTEGRATION_TOKEN")
page_ids = [
    "22b3c5d7e46349788572214d579c37c0",
    "9b2ad5bdfe4f476b9e4cc7a4d650aff6",
    "6dc212d897c64d848f59e7bf7deadfd1",
    "b3ee328534524a3289ba98199a0af8c2",
    "b3ee328534524a3289ba98199a0af8c2"
]

documents = NotionPageReader(integration_token=integration_token).load_data(
    page_ids=page_ids
)

index = GPTVectorStoreIndex.from_documents(documents)


app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])


def node_to_dict(node):
    # Assuming NodeWithScore has these attributes as an example
    return {
        "score": node.score,
        "text": node.text,
        # ... any other attributes ...
    }


@app.route("/api/ask", methods=["POST"])
def ask():
    # Parse the prompt from the JSON payload
    prompt = request.json["prompt"]

    # Query the LlamaIndex with the prompt
    query_engine = index.as_query_engine()
    response = query_engine.query(f"{prompt}")
    print(response)
    print(type(response))

    if isinstance(response, Response):
        response_text = response.response
        source_nodes_data = [node_to_dict(node) for node in response.source_nodes]# noqa
        response_data = {
            "response_text": response_text,
        }

        print(response_data)
     # or handle this case some other way

    return jsonify({"answer": response_data["response_text"]})


@app.route("/")
def hello_world():
    return "Welcome to the back-end"


if __name__ == "__main__":
    app.run(port=8080, debug=True)
