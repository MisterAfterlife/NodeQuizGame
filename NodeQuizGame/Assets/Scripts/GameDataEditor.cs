using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.IO;
using UnityEditor;
using SocketIO;

[ExecuteInEditMode]
public class GameDataEditor : EditorWindow {
    string gameDataFilePath = "/StreamingAssets/data.json";
    public RoundData roundData;
    private GameObject server;
    public SocketIOComponent socket;

    [MenuItem("Window/Game Data Editor")]
    static void Init() {
        EditorWindow.GetWindow(typeof(GameDataEditor)).Show();
    }

    void OnGUI(){ 
        if (roundData != null){
            // Display data from json
            SerializedObject serializedObject = new SerializedObject(this);
            SerializedProperty serializedProperty = 
                serializedObject.FindProperty("roundData");
            EditorGUILayout.PropertyField(serializedProperty, true);
            serializedObject.ApplyModifiedProperties();

            if (GUILayout.Button("Save Game Data")){
                SaveGameData();
            }
        }

        if (GUILayout.Button("Load Game Data")) {
            LoadGameData();
        }

        if (GUILayout.Button("Send Game Data"))
        {
            SendGameData();
        }
    }

    void LoadGameData()
    {
        string filePath = Application.dataPath + gameDataFilePath;

        if (File.Exists(filePath))
        {
            string gameData = File.ReadAllText(filePath);
            roundData = JsonUtility.FromJson<RoundData>(gameData);
        }
        else {
            roundData = new RoundData();
        }
    }

    void SaveGameData()
    {
        string jsonObj = JsonUtility.ToJson(roundData);
        string filePath = Application.dataPath + gameDataFilePath;

        File.WriteAllText(filePath, jsonObj);
    }

    void SendGameData()
    {
        string jsonObj = JsonUtility.ToJson(roundData);
        server = GameObject.Find("server");
        socket = server.GetComponent<SocketIOComponent>();

        socket.Connect();
        socket.Emit("send data", new JSONObject(jsonObj));
    }
}
