using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using System.IO;

public class DataController : MonoBehaviour {
    string gameDataFilePath = "/StreamingAssets/data.json";
    public RoundData[] allRoundData;

    void Start () {
        DontDestroyOnLoad(gameObject);

        LoadGameData();

        SceneManager.LoadScene("MenuScreen");	
	}
	
	public RoundData GetCurrentRoundData () {
        LoadGameData();
        return allRoundData[0];
	}

    void LoadGameData()
    {
        string filePath = Application.dataPath + gameDataFilePath;

        if (File.Exists(filePath))
        {
            string gameData = File.ReadAllText(filePath);
            allRoundData[0] = JsonUtility.FromJson<RoundData>(gameData);
        }
        else
        {
            allRoundData[0] = new RoundData();
        }
    }
}
