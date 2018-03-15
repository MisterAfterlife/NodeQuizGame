using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;
using System.IO;

public class Network : MonoBehaviour {
    string gameDataFilePath = "/StreamingAssets/data.json";
    static SocketIOComponent socket;
    public RoundData roundData;
    public bool isDataSet;

	// Use this for initialization
	void Start () {
		socket = GetComponent<SocketIOComponent> ();
		socket.On ("open", OnConnected);
        socket.On("sent data", OnData);
	}
	
	// Tells us we are connected
	void OnConnected (SocketIOEvent e) {
		Debug.Log ("We are Connected");
	}

    void OnData(SocketIOEvent e)
    {
        Debug.Log("Data recieved from server");
        string filePath = Application.dataPath + gameDataFilePath;

        roundData = JsonUtility.FromJson<RoundData>(e.data.ToString());
        string jsonObj = JsonUtility.ToJson(roundData);

        File.WriteAllText(filePath, jsonObj);
        Debug.Log("Round data saved");
    }
}
