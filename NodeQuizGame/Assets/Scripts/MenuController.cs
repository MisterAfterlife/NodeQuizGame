using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;
using UnityEngine.SceneManagement;

public class MenuController : MonoBehaviour {

    public GameObject server;
    SocketIOComponent socket;
    void Start()
    {
        server = GameObject.Find("server");
        socket = server.GetComponent<SocketIOComponent>();
    }
    // Use this for initialization
    public void StartGame()
    {
        SceneManager.LoadScene("Game");
    }

    public void UpdateQuestions()
    {
        Debug.Log("Requesting Data");
        socket.Emit("request data");
    }
}
