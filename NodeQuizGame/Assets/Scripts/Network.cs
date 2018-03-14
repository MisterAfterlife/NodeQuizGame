using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;

public class Network : MonoBehaviour {
 	static SocketIOComponent socket;
    static RoundData roundData;
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
        JSONObject obj = e.data;

        JSONObject obj2 = obj["datas"];

        roundData = JsonUtility.FromJson<RoundData>(obj2.ToString());

        Debug.Log("Questions updated");
    }

	float GetFloatFromJson(JSONObject data, string key){
		return float.Parse(data [key].ToString().Replace("\"", ""));
	}
}
