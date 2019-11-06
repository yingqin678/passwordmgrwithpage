package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

type account struct {
	AccountPass map[string]string
}

var fileDir string
var appContent map[string]account

func sayhelloName(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	r.ParseForm()
	if path == "/rest/ajax/queryapps" {
		appNames := make([]string, 0,5)
		for key, _ := range appContent {
			appNames = append(appNames, key)
		}
		json, _ := json.Marshal(appNames)
		fmt.Fprintf(w, string(json))
		return
	} else if path == "/rest/ajax/queryusernames" {
		appName := r.Form["appname"][0]
		for key, value := range appContent {
			if appName == key {
				userNames := make([]string, 0,5)
				for useKey, _ :=  range value.AccountPass {
					userNames = append(userNames, useKey)
				}
				json , _ := json.Marshal(userNames)
				fmt.Fprintf(w, string(json))
				return
			}
		}

		//应用下无用户信息
		fmt.Fprintf(w, "[]")
		return
	} else if path == "/rest/ajax/queryaccountinfo" {
		appName := r.Form["appname"][0]
		userName := r.Form["username"][0]
		for key, value := range appContent {
			if appName == key {
				for useKey, userValue :=  range value.AccountPass {
					if useKey == userName {
						fmt.Fprintf(w, userValue)
						return
					}
				}
			}
		}
		fmt.Fprintf(w, "")
		return
	} else if path == "/rest/ajax/add" {
		appName := r.Form["appname"][0]
		userName := r.Form["username"][0]
		userpass := r.Form["userpass"][0]
		_, ok := appContent[appName]
		if !ok {
			newAccount := new(account)
			newAccount.AccountPass = map[string]string{}
			appContent[appName] = *newAccount
		}
		appContent[appName].AccountPass[userName] = userpass
WriteApp()
		fmt.Fprintf(w, "0")
	} else if path == "/rest/ajax/deleteuser" {
		appName := r.Form["appname"][0]
		userName := r.Form["username"][0]
		delete(appContent[appName].AccountPass, userName)
WriteApp()
		fmt.Fprintf(w, "0")
	} else if path == "/rest/ajax/deleteapp" {
		appName := r.Form["appname"][0]
		delete(appContent, appName)
WriteApp()
		fmt.Fprintf(w, "0")
	}
}

func main() {
	dir, err := filepath.Abs(filepath.Dir(os.Args[0]) + "/accountpass.txt")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(dir)
	fileDir = dir
	FileCreate(dir)
//WriteApp()
	content, err := ReadAll(dir);
	if err != nil {
		panic(err)
	}

	appContent = map[string]account{}
	if len(content) > 0 {
		err := json.Unmarshal(content, &appContent)
		if err != nil {
			panic(err)
		}
	}


	http.Handle("/pages/", http.StripPrefix("/pages/", http.FileServer(assetFS())));
	http.HandleFunc("/rest/", sayhelloName) //设置访问的路由
	err = http.ListenAndServe(":9090", nil) //设置监听的端口
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func WriteApp() {
	jsonStr, err := json.Marshal(&appContent)
	if err != nil {
		panic("failed to marshal")
	}
	WriteFile(jsonStr, fileDir)
}

func FileCreate(file string) () {
	_, err := os.Stat(file)
	if err != nil {
		_, err = os.Create(file);
		if err != nil {
			panic("failed to create file")
		}
	}
}

func ReadAll(filePth string) ([]byte, error) {
	content, err := ioutil.ReadFile(filePth)
	if (err != nil) {
		return nil, err
	}
	return content, nil
}

func WriteFile(content []byte, filePath string)  {
	f, err := os.OpenFile(filePath, os.O_RDWR, 0660)
	if err != nil {
		panic(err)
	}
	f.Truncate(0)
	_, err = f.Write(content)
	if err != nil {
		panic(err)
	}
}
