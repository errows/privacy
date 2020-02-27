package main

import (
	"fmt"
	"log"
	"os"
	"time"

	eosws "github.com/dfuse-io/eosws-go"
)

var dfuseEndpoint = "wss://jungle.eos.dfuse.io/v1/stream"
var origin = "https://origin.example.io"

func main() {

	apiKey := os.Getenv("EOSWS_API_KEY")
	if apiKey == "" {
		log.Fatalf("please set your API key to environment variable EOSWS_API_KEY")
	}

	jwt, _, err := eosws.Auth(apiKey)
	if err != nil {
		log.Fatalf("cannot get JWT token: %s", err.Error())
	}

	client, err := eosws.New(dfuseEndpoint, jwt, origin)
	errorCheck("connecting to endpoint"+dfuseEndpoint, err)

	go func() {

		ga := &eosws.GetActionTraces{}
		ga.ReqID = "foo GetActions"
		ga.StartBlock = -300
		ga.Listen = true
		ga.WithProgress = 3
		ga.IrreversibleOnly = false
		ga.Data.Accounts = "messengerbus"
		ga.Data.ActionNames = "pub"
		ga.Data.WithInlineTraces = true

		fmt.Printf("Sending `get_actions` message for accounts: %s and action names: %s\n", ga.Data.Accounts, ga.Data.ActionNames)
		err = client.Send(ga)
		errorCheck("sending get_actions", err)

		for {
			fmt.Println("Top of For Block")
			msg, err := client.Read()
			if err != nil {
				fmt.Println("DIED", err)
				return
			}

			switch m := msg.(type) {
			case *eosws.ActionTrace:
				fmt.Println("Block Num:", m.Data)
			case *eosws.Progress:
				fmt.Println("Progress", m.Data.BlockNum)
			case *eosws.Listening:
				fmt.Println("listening...")
			default:
				fmt.Println("Unsupported message", m)
			}
		}
	}()

	fmt.Println("Sleeping for 8 * time.Second")
	time.Sleep(8 * time.Second)
}

func errorCheck(prefix string, err error) {
	if err != nil {
		log.Fatalf("ERROR: %s: %s\n", prefix, err)
	}
}
