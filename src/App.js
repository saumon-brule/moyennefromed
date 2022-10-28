import { useEffect, useState } from "react"
import "./App.css"
let url = "https://api.ecoledirecte.com/v3/login.awp?v=4.22.0"
let listeMoyenne = []
let listeCoef = []
let listeMatieres = []
const notUsed = ["TRONC COMMUN", "SPECIALITÉS", "OPTIONS"]

function calcMoyenne (moyennes, coefs){
  let moyenneG = 0
  let coefG = 0
  moyennes.forEach((moyenne, index) => {
    moyenneG += moyenne * listeCoef[index] 
  })
  coefs.forEach((coef) => {
    coefG += coef
  })
  return (Math.round(moyenneG / coefG * 100)/100)
}

function App() {
  const [id, setLogin] = useState("")
  const [pwd, setPassword] = useState("")
  const [token, setToken] = useState(undefined)
  const [code, setCode] = useState(undefined)
  const [userId, setUserId] = useState(undefined)
  const [listeEleves, setListeEleves] = useState([])
  const [listePeriodes, setListePeriodes] = useState([])
  const [loading, setLoading] = useState(false)
  const [moyenneG, setMoyenneG] = useState(undefined)
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) setToken(token)
    const eleves = JSON.parse(localStorage.getItem("eleves"))
    if (eleves) setListeEleves(eleves)
    const periodes = JSON.parse(localStorage.getItem("periodes"))
    if (periodes) setListePeriodes(periodes)
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    let init = {
      "body": `data={"uuid": "", "identifiant": "${id}", "motdepasse": "${pwd}", "isReLogin": "false"}`,
      "method": "POST"
    }
    fetch(url, init)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        if (data["code"] === 200) {
          setToken(data["token"])
          localStorage.setItem("token", data["token"])
          setCode(data["code"])
          if (data["data"]["accounts"][0]["typeCompte"] === "2") {
            setListeEleves(data["data"]["accounts"][0]["profile"]["eleves"].map((eleve) => ({ id: eleve.id, prenom: eleve.prenom })))
            localStorage.setItem("eleves", JSON.stringify(data["data"]["accounts"][0]["profile"]["eleves"].map((eleve) => ({ id: eleve.id, prenom: eleve.prenom }))))
          } else {
            setListeEleves(data["data"]["accounts"].map((eleve) => ({ id: eleve.id, prenom: eleve.prenom })))
            localStorage.setItem("eleves", JSON.stringify(data["data"]["accounts"].map((eleve) => ({ id: eleve.id, prenom: eleve.prenom }))))
          }

        }
        else {
          setCode(data["code"])
        }
      })
      .finally(() => setLoading(false))
  }
  function handleSubmitId(event) {
    event.preventDefault()
    setLoading(true)
    url = "https://api.ecoledirecte.com/v3/eleves/" + String(userId) + "/notes.awp?verbe=get&v=4.23.0"
    let init = {
      "headers": { "x-token": token },
      "body": `data={"anneeScolaire":""}`,
      "method": "POST"
    }
    fetch(url, init)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        if (data["code"] === 200) {
          setToken(data["token"])
          localStorage.setItem("token", data["token"])
          let periodes = data["data"]["periodes"].filter((periodesId) => periodesId?.periode?.includes("Trimestre"))
          setListePeriodes(periodes)
          localStorage.setItem("periodes", JSON.stringify(periodes))
        }
        else {
          setCode(data["code"])
        }
      })
      .finally(() => setLoading(false))
  }



  function moyenneCalc(trimestre) {
    listeMatieres = listePeriodes[trimestre]["ensembleMatieres"]["disciplines"].filter((matiere) => !notUsed.includes(matiere["discipline"]))
    console.log(listeMatieres)
    listeMoyenne = []
    listeCoef = []
    listeMatieres.forEach((matiere) => {
      if (matiere["moyenne"]) {
        listeCoef.push(parseInt(matiere["coef"]))
        listeMoyenne.push(parseFloat(matiere["moyenne"].replace(",", ".")))
      }
    })
    setMoyenneG(calcMoyenne(listeMoyenne, listeCoef))
  }



  function Disconnect() {
    setLogin("")
    setPassword("")
    setToken(undefined)
    setListeEleves([])
    setListePeriodes([])
    localStorage.removeItem("token")
    localStorage.removeItem("eleves")
    localStorage.removeItem("periodes")
  }
  return (
    <>
      {token && <div onClick={Disconnect} style={{ textAlign: "right", marginTop: "1%", marginRight: "1.5%" }}>
        <input type="button" value="disconnect" style={{ fontSize: "0.8em", color: "white", background: "none", width: "15%", borderWidth: "3px", borderStyle: "solid", borderColor: "#eef7ff", borderRadius: "15px", outline: "none", cursor: "pointer" }} />
      </div>}


      {!token && <div className="container" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", padding: "0px", margin: "0px" }}>
        <div className="login-box" style={{ padding: "20px", borderWidth: "1px", borderStyle: "solid", borderColor: "grey", borderRadius: "10px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ width: "100%" }}>
              <label htmlFor="email">Identifiant :</label>
              <input type="text" style={{ fontSize: "1.2em", color: "white", outline: "none", border: "none", borderBottom: "4px solid #eef7ff", marginBottom: "20px", width: "93%", minWidth: "30px", background: "none" }} id="email" placeholder="Entrez votre identifiant" value={id} onChange={(event) => setLogin(event.target.value)} />
            </div>
            <div style={{ width: "100%" }}>
              <label htmlFor="mdp">Mot de passe :</label>
              <input type="password" style={{ fontSize: "1.2em", color: "white", outline: "none", border: "none", borderBottom: "4px solid #eef7ff", marginBottom: "20px", width: "93%", minWidth: "30px", background: "none" }} id="mdp" value={pwd} placeholder="Entrez votre mot de passe" onChange={(event) => setPassword(event.target.value)} />
            </div>
            <div style={{ textAlign: "center" }}>
              {loading ? <p style={{ fontSize: "1.2em", color: "white", background: "none", width: "100%", borderWidth: "3px", borderStyle: "solid", borderColor: "#eef7ff", borderRadius: "15px", outline: "none", cursor: "pointer" }}>loading ...</p> : <input type="submit" value="Envoyer" style={{ fontSize: "1.2em", color: "white", background: "none", width: "100%", borderWidth: "3px", borderStyle: "solid", borderColor: "#eef7ff", borderRadius: "15px", outline: "none", cursor: "pointer" }} />}
            </div>
          </form>
        </div>
      </div>}

      {code && code !== 200 && <div>
        <p style={{ textAlign: "center", color: "#C10000" }}>
          Une erreur s'est produite.
        </p>
      </div>}
      {localStorage.getItem("eleves") && !localStorage.getItem("periodes") && <div className="choix-compte" id="choix-compte" style={{ minWidth: 125, position: "absolute", top: "auto", left: "37.5%", border: "1px grey solid", width: "25%", height: "auto", transform: "translateY(75%)", overflowX: "hidden", borderRadius: "10px" }}>
        <form onSubmit={handleSubmitId}>
          {listeEleves.map((eleve) => <div key={eleve.id} style={{ top: "auto", left: "50%", width: "25%", height: "30%" }}>
            <input className="userIdButton" type="radio" id={eleve.id} value={eleve.id} name="eleves" style={{ margin: "5px", display: "inlineBlock", WebkitAppearance: "none", appearance: "none", margin: 0, font: "inherit", color: "lightblue", width: "1.15em", height: "1.15em", border: "0.15em solid currentColor", borderRadius: "50%", display: "grid", placeContent: "center" }} onChange={(event) => setUserId(event.target.value)} />
            <label style={{ transform: "translateX(20px)", fontWeight: "bold", display: "grid", gridTemplateColumns: "1em auto", gap: "1em" }} htmlFor={eleve.id}>{eleve.prenom}</label>
          </div>)}
          <div style={{ textAlign: "center" }}>
            {loading ? <p style={{ fontSize: "1.2em", color: "white", background: "none", width: "100%", borderWidth: "3px", borderStyle: "solid", borderColor: "#eef7ff", borderRadius: "15px", outline: "none", cursor: "pointer" }}>loading ...</p> : <input type="submit" value="Envoyer" style={{ fontSize: "1.2em", color: "white", background: "none", width: "90%", borderWidth: "3px", borderStyle: "solid", borderColor: "#eef7ff", borderRadius: "15px", outline: "none", cursor: "pointer", margin: 5, marginTop: 30 }} />}
          </div>
        </form>
      </div>}
      <div style={{ textAlign: "center" }}>
        {localStorage.getItem("periodes") && listePeriodes.map((periodes, index) => <div key={index} >
          <input type="button" onClick={() => moyenneCalc(index)} id={index} value={periodes.periode} name="periodes" style={{ textAlign: "left", left: "0%", margin: 3, fontSize: "0.8em", color: "white", background: "none", width: "15%", borderWidth: "3px", borderStyle: "solid", borderColor: "#eef7ff", borderRadius: "15px", outline: "none", cursor: "pointer" }} />
          <label style={{}} htmlFor={index}>{periodes.periode}</label>
        </div>)}
      </div>
      <p>
        {!!moyenneG ? moyenneG : 'Aucune moyenne'}
      </p>
    </>
  )
}

export default App