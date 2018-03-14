using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using SocketIO;

public class DataController : MonoBehaviour {

    public RoundData[] allRoundData;
    public SocketIOComponent socket;


    void Start () {
        DontDestroyOnLoad(gameObject);

        SceneManager.LoadScene("MenuScreen");	
	}
	
	public RoundData GetCurrentRoundData () {
        return allRoundData[0];
	}
}
